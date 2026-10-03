package com.its.issueservice.service.impl;

import com.its.issueservice.dto.IssueRequest;
import com.its.issueservice.dto.IssueResponse;
import com.its.issueservice.dto.UpdateIssueRequest;
import com.its.issueservice.entity.Issue;
import com.its.issueservice.entity.IssueStatus;
import com.its.issueservice.entity.IssueType;
import com.its.issueservice.entity.Priority;
import com.its.issueservice.exception.InvalidRequestException;
import com.its.issueservice.exception.ResourceNotFoundException;
import com.its.issueservice.repository.IssueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link IssueServiceImpl}. The repository is mocked and
 * the clock is fixed, so "today" is always 2026-10-03.
 */
@ExtendWith(MockitoExtension.class)
class IssueServiceImplTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 10, 3);
    private static final Clock FIXED_CLOCK =
            Clock.fixed(TODAY.atStartOfDay(ZoneId.of("UTC")).toInstant(), ZoneId.of("UTC"));

    @Mock
    private IssueRepository issueRepository;

    private IssueServiceImpl issueService;

    @BeforeEach
    void setUp() {
        issueService = new IssueServiceImpl(issueRepository, FIXED_CLOCK);
    }

    private static IssueRequest minimalRequest() {
        return new IssueRequest("Login fails", null, 101, "Cannot log in", Priority.HIGH, 2,
                null, null, null, null, null, null, null);
    }

    private static Issue existingIssue() {
        Issue issue = new Issue();
        issue.setId(201);
        issue.setSummary("Login Feature");
        issue.setType(IssueType.BUG);
        issue.setProject(101);
        issue.setDescription("Implement login");
        issue.setPriority(Priority.HIGH);
        issue.setAssignee(2);
        issue.setStatus(IssueStatus.TO_DO);
        issue.setCreatedOn(LocalDate.of(2023, 1, 10));
        issue.setLastUpdated(LocalDate.of(2023, 1, 15));
        return issue;
    }

    @Test
    void createIssue_appliesDefaults() {
        when(issueRepository.save(any(Issue.class))).thenAnswer(invocation -> {
            Issue saved = invocation.getArgument(0);
            saved.setId(210);
            return saved;
        });

        IssueResponse response = issueService.createIssue(minimalRequest());

        assertThat(response.id()).isEqualTo(210);
        assertThat(response.type()).isEqualTo(IssueType.TASK);
        assertThat(response.status()).isEqualTo(IssueStatus.TO_DO);
        assertThat(response.createdOn()).isEqualTo(TODAY);
        assertThat(response.lastUpdated()).isEqualTo(TODAY);
    }

    @Test
    void createIssue_keepsProvidedValues() {
        when(issueRepository.save(any(Issue.class))).thenAnswer(invocation -> invocation.getArgument(0));
        LocalDate createdOn = LocalDate.of(2026, 9, 1);

        IssueResponse response = issueService.createIssue(new IssueRequest(
                " Payment bug ", IssueType.BUG, 101, " Card declined ", Priority.MEDIUM, 3,
                1, "Payment", "Sprint 10", 5, IssueStatus.DEVELOPMENT, createdOn, "  "));

        assertThat(response.summary()).isEqualTo("Payment bug");
        assertThat(response.type()).isEqualTo(IssueType.BUG);
        assertThat(response.status()).isEqualTo(IssueStatus.DEVELOPMENT);
        assertThat(response.createdOn()).isEqualTo(createdOn);
        assertThat(response.lastUpdated()).isEqualTo(TODAY);
        assertThat(response.comments()).isNull(); // blank text is stored as null
    }

    @Test
    void getIssueById_whenMissing_throwsNotFound() {
        when(issueRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> issueService.getIssueById(999))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Issue with ID 999 not found");
    }

    @Test
    void getIssuesByProject_returnsProjectIssues() {
        when(issueRepository.findByProject(101)).thenReturn(List.of(existingIssue()));

        assertThat(issueService.getIssuesByProject(101))
                .extracting(IssueResponse::id).containsExactly(201);
    }

    @Test
    void getIssuesByAssignee_returnsAssignedIssues() {
        when(issueRepository.findByAssignee(2)).thenReturn(List.of(existingIssue()));

        assertThat(issueService.getIssuesByAssignee(2))
                .extracting(IssueResponse::assignee).containsExactly(2);
    }

    @Test
    void updateIssue_changesOnlyProvidedFieldsAndTouchesLastUpdated() {
        Issue issue = existingIssue();
        when(issueRepository.findById(201)).thenReturn(Optional.of(issue));
        when(issueRepository.save(any(Issue.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IssueResponse response = issueService.updateIssue(201, new UpdateIssueRequest(
                null, null, null, null, Priority.LOW, 5, null, null, null, IssueStatus.TESTING, null));

        assertThat(response.priority()).isEqualTo(Priority.LOW);
        assertThat(response.assignee()).isEqualTo(5);
        assertThat(response.status()).isEqualTo(IssueStatus.TESTING);
        assertThat(response.summary()).isEqualTo("Login Feature");
        assertThat(response.createdOn()).isEqualTo(LocalDate.of(2023, 1, 10));
        assertThat(response.lastUpdated()).isEqualTo(TODAY);
    }

    @Test
    void updateIssue_withBlankSummary_throwsInvalidRequest() {
        when(issueRepository.findById(201)).thenReturn(Optional.of(existingIssue()));

        assertThatThrownBy(() -> issueService.updateIssue(201, new UpdateIssueRequest(
                "   ", null, null, null, null, null, null, null, null, null, null)))
                .isInstanceOf(InvalidRequestException.class);
        verify(issueRepository, never()).save(any());
    }

    @Test
    void updateStatus_changesStatusAndLastUpdated() {
        when(issueRepository.findById(201)).thenReturn(Optional.of(existingIssue()));
        when(issueRepository.save(any(Issue.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IssueResponse response = issueService.updateStatus(201, IssueStatus.COMPLETED);

        assertThat(response.status()).isEqualTo(IssueStatus.COMPLETED);
        assertThat(response.lastUpdated()).isEqualTo(TODAY);
    }

    @Test
    void deleteIssue_whenMissing_throwsNotFound() {
        when(issueRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> issueService.deleteIssue(999))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(issueRepository, never()).delete(any());
    }
}
