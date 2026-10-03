package com.its.userservice.controller;

import com.its.userservice.dto.IssueDto;
import com.its.userservice.dto.ProjectDto;
import com.its.userservice.exception.ResourceNotFoundException;
import com.its.userservice.exception.ServiceUnavailableException;
import com.its.userservice.service.UserActivityService;
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
 * Web-layer tests for {@link UserActivityController}. The service is mocked.
 */
@WebMvcTest(UserActivityController.class)
class UserActivityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserActivityService userActivityService;

    private static final IssueDto ISSUE = new IssueDto(201, "Login Feature", "BUG", 101, "Implement login",
            "HIGH", 2, null, "Authentication", "Sprint 1", 5, "TO DO",
            LocalDate.of(2023, 1, 10), LocalDate.of(2023, 1, 15), null);

    @Test
    void getAssignedIssues_returns200WithIssues() throws Exception {
        when(userActivityService.getAssignedIssues(2)).thenReturn(List.of(ISSUE));

        mockMvc.perform(get("/api/users/2/issues"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(201))
                .andExpect(jsonPath("$[0].status").value("TO DO"));
    }

    @Test
    void getAssignedIssuesByUsername_handlesSpacesInName() throws Exception {
        when(userActivityService.getAssignedIssuesByUsername("Bob Johnson")).thenReturn(List.of(ISSUE));

        mockMvc.perform(get("/api/users/username/{username}/issues", "Bob Johnson"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].assignee").value(2));
    }

    @Test
    void getAssignedIssues_forUnknownUser_returns404() throws Exception {
        when(userActivityService.getAssignedIssues(99))
                .thenThrow(new ResourceNotFoundException("User with ID 99 not found"));

        mockMvc.perform(get("/api/users/99/issues"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User with ID 99 not found"));
    }

    @Test
    void getAssignedIssues_whenIssueServiceDown_returns503() throws Exception {
        when(userActivityService.getAssignedIssues(2)).thenThrow(new ServiceUnavailableException(
                "Issue service is not available right now. Please try again later.", null));

        mockMvc.perform(get("/api/users/2/issues"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value(503));
    }

    @Test
    void getOwnedProjects_returns200WithProjects() throws Exception {
        when(userActivityService.getOwnedProjects(1)).thenReturn(List.of(
                new ProjectDto(101, "Project Alpha", 1, LocalDate.of(2023, 1, 1), LocalDate.of(2023, 12, 31))));

        mockMvc.perform(get("/api/users/1/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].projectName").value("Project Alpha"));
    }
}
