package com.its.issueservice.service;

import com.its.issueservice.dto.CommentRequest;
import com.its.issueservice.dto.CommentResponse;

import java.util.List;

/**
 * Business operations for comments on issues.
 */
public interface CommentService {

    CommentResponse addComment(Integer issueId, CommentRequest request);

    /** Comments of an issue, oldest first. */
    List<CommentResponse> getComments(Integer issueId);

    CommentResponse updateComment(Integer issueId, Integer commentId, CommentRequest request);

    void deleteComment(Integer issueId, Integer commentId);
}
