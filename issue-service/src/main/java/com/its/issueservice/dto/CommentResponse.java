package com.its.issueservice.dto;

import com.its.issueservice.entity.Comment;

import java.time.LocalDate;

/**
 * Comment data returned by the API.
 */
public record CommentResponse(
        Integer commentId,
        Integer issueId,
        String text,
        LocalDate createdDate,
        LocalDate lastUpdated
) {

    /** Builds the response object from the JPA entity. */
    public static CommentResponse from(Comment comment) {
        return new CommentResponse(
                comment.getCommentId(),
                comment.getIssueId(),
                comment.getText(),
                comment.getCreatedDate(),
                comment.getLastUpdated());
    }
}
