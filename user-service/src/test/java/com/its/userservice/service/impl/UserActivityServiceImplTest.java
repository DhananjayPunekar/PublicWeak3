package com.its.userservice.service.impl;

import com.its.userservice.client.IssueClient;
import com.its.userservice.client.ProjectClient;
import com.its.userservice.dto.IssueDto;
import com.its.userservice.dto.ProjectDto;
import com.its.userservice.entity.Role;
import com.its.userservice.entity.User;
import com.its.userservice.exception.ResourceNotFoundException;
import com.its.userservice.exception.ServiceUnavailableException;
import com.its.userservice.repository.UserRepository;
import feign.FeignException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link UserActivityServiceImpl}. Repository and clients are mocked,
 * so no other service needs to run.
 */
@ExtendWith(MockitoExtension.class)
class UserActivityServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private IssueClient issueClient;

    @Mock
    private ProjectClient projectClient;

    private UserActivityServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new UserActivityServiceImpl(userRepository, issueClient, projectClient);
    }

    private static IssueDto issue(int id, int assignee) {
        return new IssueDto(id, "Issue " + id, "BUG", 101, "desc", "HIGH", assignee, null,
                null, null, null, "TO DO", LocalDate.of(2023, 1, 10), LocalDate.of(2023, 1, 15), null);
    }

    private static User user(int id, String name) {
        User user = new User(name, name.toLowerCase().replace(' ', '.') + "@example.com", "hash", Role.ASSIGNEE, null);
        user.setUserId(id);
        return user;
    }

    @Test
    void getAssignedIssues_returnsIssuesFromIssueService() {
        when(userRepository.existsById(2)).thenReturn(true);
        when(issueClient.getIssuesByAssignee(2)).thenReturn(List.of(issue(201, 2), issue(203, 2)));

        assertThat(service.getAssignedIssues(2)).extracting(IssueDto::id).containsExactly(201, 203);
    }

    @Test
    void getAssignedIssues_forUnknownUser_throwsNotFoundWithoutCallingIssueService() {
        when(userRepository.existsById(99)).thenReturn(false);

        assertThatThrownBy(() -> service.getAssignedIssues(99))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User with ID 99 not found");
        verify(issueClient, never()).getIssuesByAssignee(any());
    }

    @Test
    void getAssignedIssues_whenIssueServiceDown_throwsServiceUnavailable() {
        when(userRepository.existsById(2)).thenReturn(true);
        when(issueClient.getIssuesByAssignee(2)).thenThrow(FeignException.class);

        assertThatThrownBy(() -> service.getAssignedIssues(2))
                .isInstanceOf(ServiceUnavailableException.class);
    }

    @Test
    void getAssignedIssuesByUsername_combinesIssuesOfUsersWithThatName() {
        when(userRepository.findByNameIgnoreCase("Bob Johnson"))
                .thenReturn(List.of(user(2, "Bob Johnson"), user(12, "Bob Johnson")));
        when(issueClient.getIssuesByAssignee(2)).thenReturn(List.of(issue(201, 2)));
        when(issueClient.getIssuesByAssignee(12)).thenReturn(List.of(issue(210, 12)));

        assertThat(service.getAssignedIssuesByUsername(" Bob Johnson "))
                .extracting(IssueDto::id).containsExactly(201, 210);
    }

    @Test
    void getAssignedIssuesByUsername_forUnknownName_throwsNotFound() {
        when(userRepository.findByNameIgnoreCase("Nobody")).thenReturn(List.of());

        assertThatThrownBy(() -> service.getAssignedIssuesByUsername("Nobody"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("No user named 'Nobody' found");
    }

    @Test
    void getOwnedProjects_returnsProjectsFromProjectService() {
        when(userRepository.existsById(1)).thenReturn(true);
        when(projectClient.getProjectsByOwner(1)).thenReturn(List.of(
                new ProjectDto(101, "Project Alpha", 1, LocalDate.of(2023, 1, 1), LocalDate.of(2023, 12, 31))));

        assertThat(service.getOwnedProjects(1)).extracting(ProjectDto::projectName).containsExactly("Project Alpha");
    }
}
