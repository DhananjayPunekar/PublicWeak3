package com.its.projectservice.controller;

import com.its.projectservice.dto.ProjectRequest;
import com.its.projectservice.dto.ProjectResponse;
import com.its.projectservice.exception.DuplicateResourceException;
import com.its.projectservice.exception.ResourceNotFoundException;
import com.its.projectservice.service.ProjectService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer tests for {@link ProjectController}: request validation,
 * HTTP status codes and JSON shape. The service is mocked.
 */
@WebMvcTest(ProjectController.class)
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProjectService projectService;

    private static final ProjectResponse ALPHA = new ProjectResponse(
            101, "Project Alpha", 1, LocalDate.of(2023, 1, 1), LocalDate.of(2023, 12, 31));

    @Test
    void createProject_returns201WithMessageAndProjectId() throws Exception {
        when(projectService.createProject(any(ProjectRequest.class))).thenReturn(ALPHA);

        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"projectName":"Project Alpha","productOwner":1,
                                 "startDate":"2023-01-01","endDate":"2023-12-31"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/projects/101"))
                .andExpect(jsonPath("$.message").value("Project created successfully"))
                .andExpect(jsonPath("$.projectId").value(101))
                .andExpect(jsonPath("$.project.startDate").value("2023-01-01"));
    }

    @Test
    void createProject_withMissingFields_returns400WithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"projectName":"","productOwner":-5}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.projectName").exists())
                .andExpect(jsonPath("$.fieldErrors.productOwner").exists())
                .andExpect(jsonPath("$.fieldErrors.startDate").exists())
                .andExpect(jsonPath("$.fieldErrors.endDate").exists());
    }

    @Test
    void createProject_withInvalidDate_returns400NamingTheField() throws Exception {
        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"projectName":"X","productOwner":1,"startDate":"2023-13-01","endDate":"2023-12-31"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("startDate")));
    }

    @Test
    void createProject_withBrokenJson_returns400WithLocation() throws Exception {
        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "projectName": "Project Zeta,
                                  "productOwner": 1
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", startsWith("Malformed JSON at line 2")));
    }

    @Test
    void createProject_withDuplicateName_returns409() throws Exception {
        when(projectService.createProject(any(ProjectRequest.class)))
                .thenThrow(new DuplicateResourceException("A project named 'Project Alpha' already exists"));

        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"projectName":"Project Alpha","productOwner":1,
                                 "startDate":"2023-01-01","endDate":"2023-12-31"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void getAllProjects_returns200WithList() throws Exception {
        when(projectService.getAllProjects()).thenReturn(List.of(ALPHA));

        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].projectName").value("Project Alpha"));
    }

    @Test
    void getProjectsByOwner_returns200WithList() throws Exception {
        when(projectService.getProjectsByOwner(1)).thenReturn(List.of(ALPHA));

        mockMvc.perform(get("/api/projects/owner/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(101));
    }

    @Test
    void getProjectById_whenMissing_returns404() throws Exception {
        when(projectService.getProjectById(999))
                .thenThrow(new ResourceNotFoundException("Project with ID 999 not found"));

        mockMvc.perform(get("/api/projects/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Project with ID 999 not found"))
                .andExpect(jsonPath("$.path").value("/api/projects/999"));
    }

    @Test
    void getProjectById_withNonNumericId_returns400() throws Exception {
        mockMvc.perform(get("/api/projects/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteProject_returns200WithMessage() throws Exception {
        mockMvc.perform(delete("/api/projects/105"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Project with ID 105 deleted successfully"));
    }
}
