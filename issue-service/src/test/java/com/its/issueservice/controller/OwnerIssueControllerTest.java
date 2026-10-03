package com.its.issueservice.controller;

import com.its.issueservice.dto.IssueResponse;
import com.its.issueservice.entity.IssueStatus;
import com.its.issueservice.entity.IssueType;
import com.its.issueservice.entity.Priority;
import com.its.issueservice.exception.ServiceUnavailableException;
import com.its.issueservice.service.OwnerIssueService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer tests for {@link OwnerIssueController}. The service is mocked.
 */
@WebMvcTest(OwnerIssueController.class)
class OwnerIssueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OwnerIssueService ownerIssueService;

    @Test
    void getIssuesByOwner_returns200WithIssues() throws Exception {
        when(ownerIssueService.getIssuesByOwner(1)).thenReturn(List.of(new IssueResponse(
                201, "Login Feature", IssueType.BUG, 101, "Implement login", Priority.HIGH, 2, null,
                "Authentication", "Sprint 1", 5, IssueStatus.TO_DO,
                LocalDate.of(2023, 1, 10), LocalDate.of(2023, 1, 15), null)));

        mockMvc.perform(get("/api/issues/owner/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(201))
                .andExpect(jsonPath("$[0].status").value("TO DO"));
    }

    @Test
    void getIssuesByOwner_whenProjectServiceDown_returns503() throws Exception {
        when(ownerIssueService.getIssuesByOwner(1)).thenThrow(new ServiceUnavailableException(
                "Project service is not available right now. Please try again later.", null));

        mockMvc.perform(get("/api/issues/owner/1"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message").value(
                        "Project service is not available right now. Please try again later."));
    }
}
