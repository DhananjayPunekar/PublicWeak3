package com.its.issueservice.controller;

import com.its.issueservice.dto.CommentRequest;
import com.its.issueservice.dto.CommentResponse;
import com.its.issueservice.dto.MessageResponse;
import com.its.issueservice.exception.ApiError;
import com.its.issueservice.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * REST endpoints for comments on an issue ("in-issue commenting").
 */
@RestController
@RequestMapping("/api/issues/{issueId}/comments")
@Tag(name = "Comments", description = "Comments on an issue")
public class CommentController {

    private final CommentService commentService;

    @Autowired
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @Operation(summary = "Add a comment to an issue")
    @ApiResponse(responseCode = "201", description = "Comment added")
    @ApiResponse(responseCode = "400", description = "Empty comment",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "404", description = "Issue not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @PostMapping
    public ResponseEntity<CommentResponse> addComment(@PathVariable Integer issueId,
                                                      @Valid @RequestBody CommentRequest request) {
        CommentResponse comment = commentService.addComment(issueId, request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{commentId}")
                .buildAndExpand(comment.commentId())
                .toUri();
        return ResponseEntity.created(location).body(comment);
    }

    @Operation(summary = "Get the comments of an issue (oldest first)")
    @ApiResponse(responseCode = "200", description = "List of comments")
    @ApiResponse(responseCode = "404", description = "Issue not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Integer issueId) {
        return ResponseEntity.ok(commentService.getComments(issueId));
    }

    @Operation(summary = "Edit a comment")
    @ApiResponse(responseCode = "200", description = "Comment updated")
    @ApiResponse(responseCode = "404", description = "Issue or comment not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(@PathVariable Integer issueId,
                                                         @PathVariable Integer commentId,
                                                         @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.ok(commentService.updateComment(issueId, commentId, request));
    }

    @Operation(summary = "Delete a comment")
    @ApiResponse(responseCode = "200", description = "Comment deleted")
    @ApiResponse(responseCode = "404", description = "Issue or comment not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @DeleteMapping("/{commentId}")
    public ResponseEntity<MessageResponse> deleteComment(@PathVariable Integer issueId,
                                                         @PathVariable Integer commentId) {
        commentService.deleteComment(issueId, commentId);
        return ResponseEntity.ok(new MessageResponse("Comment with ID " + commentId + " deleted successfully"));
    }
}
