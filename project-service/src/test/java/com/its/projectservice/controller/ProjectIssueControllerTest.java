package com.its.projectservice.controller;

import com.its.projectservice.dto.IssueDto;
import com.its.projectservice.exception.ResourceNotFoundException;
import com.its.projectservice.exception.ServiceUnavailableException;
import com.its.projectservice.service.ProjectIssueService;
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
 * Web-layer tests for {@link ProjectIssueController}. The service is mocked.
 */
@WebMvcTest(ProjectIssueController.class)
class ProjectIssueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProjectIssueService projectIssueService;

    private static final IssueDto ISSUE = new IssueDto(201, "Login Feature", "BUG", 101, "Implement login",
            "HIGH", 2, null, "Authentication", "Sprint 1", 5, "TO DO",
            LocalDate.of(2023, 1, 10), LocalDate.of(2023, 1, 15), null);

    @Test
    void getIssuesByProjectId_returns200WithIssues() throws Exception {
        when(projectIssueService.getIssuesByProjectId(101)).thenReturn(List.of(ISSUE));

        mockMvc.perform(get("/api/projects/101/issues"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(201));
    }

    @Test
    void getIssuesByProjectName_handlesSpacesInName() throws Exception {
        when(projectIssueService.getIssuesByProjectName("Project Alpha")).thenReturn(List.of(ISSUE));

        mockMvc.perform(get("/api/projects/projectName/{projectName}/issues", "Project Alpha"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].project").value(101));
    }

    @Test
    void getIssuesByProjectId_forUnknownProject_returns404() throws Exception {
        when(projectIssueService.getIssuesByProjectId(999))
                .thenThrow(new ResourceNotFoundException("Project with ID 999 not found"));

        mockMvc.perform(get("/api/projects/999/issues"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getIssuesByProjectId_whenIssueServiceDown_returns503() throws Exception {
        when(projectIssueService.getIssuesByProjectId(101)).thenThrow(new ServiceUnavailableException(
                "Issue service is not available right now. Please try again later.", null));

        mockMvc.perform(get("/api/projects/101/issues"))
                .andExpect(status().isServiceUnavailable());
    }
}
