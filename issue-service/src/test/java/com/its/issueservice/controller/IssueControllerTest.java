package com.its.issueservice.controller;

import com.its.issueservice.dto.CommentRequest;
import com.its.issueservice.dto.CommentResponse;
import com.its.issueservice.dto.IssueRequest;
import com.its.issueservice.dto.IssueResponse;
import com.its.issueservice.entity.IssueStatus;
import com.its.issueservice.entity.IssueType;
import com.its.issueservice.entity.Priority;
import com.its.issueservice.exception.ResourceNotFoundException;
import com.its.issueservice.service.CommentService;
import com.its.issueservice.service.IssueService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer tests for {@link IssueController} and {@link CommentController}:
 * request validation, HTTP status codes and JSON shape. Services are mocked.
 */
@WebMvcTest(controllers = {IssueController.class, CommentController.class})
class IssueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private IssueService issueService;

    @MockitoBean
    private CommentService commentService;

    private static IssueResponse issue(IssueStatus status) {
        return new IssueResponse(201, "Login Feature", IssueType.BUG, 101, "Implement login",
                Priority.HIGH, 2, null, "Authentication", "Sprint 1", 5, status,
                LocalDate.of(2023, 1, 10), LocalDate.of(2023, 1, 15), null);
    }

    @Test
    void createIssue_returns201WithMessageAndIssueId() throws Exception {
        when(issueService.createIssue(any(IssueRequest.class))).thenReturn(issue(IssueStatus.TO_DO));

        mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"summary":"Login Feature","type":"bug","project":101,
                                 "description":"Implement login","priority":"high","assignee":2}
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/issues/201"))
                .andExpect(jsonPath("$.message").value("Issue created successfully"))
                .andExpect(jsonPath("$.issueId").value(201))
                .andExpect(jsonPath("$.issue.status").value("TO DO"))
                .andExpect(jsonPath("$.issue.priority").value("HIGH"));
    }

    @Test
    void createIssue_withMissingFields_returns400WithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"summary":"","storyPoint":-1}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.summary").exists())
                .andExpect(jsonPath("$.fieldErrors.project").exists())
                .andExpect(jsonPath("$.fieldErrors.description").exists())
                .andExpect(jsonPath("$.fieldErrors.priority").exists())
                .andExpect(jsonPath("$.fieldErrors.assignee").exists())
                .andExpect(jsonPath("$.fieldErrors.storyPoint").exists());
    }

    @Test
    void createIssue_withUnknownPriority_returns400ListingAllowedValues() throws Exception {
        mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"summary":"X","project":101,"description":"Y","priority":"URGENT","assignee":2}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Invalid priority 'URGENT'. Allowed values: HIGH, MEDIUM, LOW"));
    }

    @Test
    void updateStatus_acceptsUnderscoreSpelling_returns200() throws Exception {
        when(issueService.updateStatus(201, IssueStatus.TO_DO)).thenReturn(issue(IssueStatus.TO_DO));

        mockMvc.perform(patch("/api/issues/201/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"to_do"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("TO DO"));

        verify(issueService).updateStatus(201, IssueStatus.TO_DO);
    }

    @Test
    void updateStatus_withUnknownStatus_returns400() throws Exception {
        mockMvc.perform(patch("/api/issues/201/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"DONE"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Invalid status 'DONE'. Allowed values: TO DO, DEVELOPMENT, TESTING, COMPLETED"));
    }

    @Test
    void getIssuesByProject_returns200WithList() throws Exception {
        when(issueService.getIssuesByProject(101)).thenReturn(List.of(issue(IssueStatus.TESTING)));

        mockMvc.perform(get("/api/issues/project/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].project").value(101))
                .andExpect(jsonPath("$[0].createdOn").value("2023-01-10"));
    }

    @Test
    void getIssuesByAssignee_returns200WithList() throws Exception {
        when(issueService.getIssuesByAssignee(2)).thenReturn(List.of(issue(IssueStatus.TESTING)));

        mockMvc.perform(get("/api/issues/assignee/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].assignee").value(2));
    }

    @Test
    void getIssueById_whenMissing_returns404() throws Exception {
        when(issueService.getIssueById(999)).thenThrow(new ResourceNotFoundException("Issue with ID 999 not found"));

        mockMvc.perform(get("/api/issues/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Issue with ID 999 not found"));
    }

    @Test
    void deleteIssue_returns200WithMessage() throws Exception {
        mockMvc.perform(delete("/api/issues/209"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Issue with ID 209 deleted successfully"));
    }

    @Test
    void addComment_returns201() throws Exception {
        when(commentService.addComment(eq(201), any(CommentRequest.class)))
                .thenReturn(new CommentResponse(1, 201, "Reproduced", LocalDate.of(2026, 10, 3),
                        LocalDate.of(2026, 10, 3)));

        mockMvc.perform(post("/api/issues/201/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"text":"Reproduced"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/issues/201/comments/1"))
                .andExpect(jsonPath("$.text").value("Reproduced"));
    }

    @Test
    void addComment_withEmptyText_returns400() throws Exception {
        mockMvc.perform(post("/api/issues/201/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"text":"  "}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.text").exists());
    }
}
