package com.its.issueservice.service.impl;

import com.its.issueservice.dto.CommentRequest;
import com.its.issueservice.dto.CommentResponse;
import com.its.issueservice.entity.Comment;
import com.its.issueservice.exception.ResourceNotFoundException;
import com.its.issueservice.repository.CommentRepository;
import com.its.issueservice.repository.IssueRepository;
import com.its.issueservice.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

/**
 * Default implementation of {@link CommentService}.
 * Every operation first checks that the issue exists.
 */
@Service
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final Clock clock;

    @Autowired
    public CommentServiceImpl(CommentRepository commentRepository, IssueRepository issueRepository, Clock clock) {
        this.commentRepository = commentRepository;
        this.issueRepository = issueRepository;
        this.clock = clock;
    }

    @Override
    @Transactional
    public CommentResponse addComment(Integer issueId, CommentRequest request) {
        requireIssue(issueId);
        Comment comment = new Comment(issueId, request.text().trim(), LocalDate.now(clock));
        return CommentResponse.from(commentRepository.save(comment));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Integer issueId) {
        requireIssue(issueId);
        return commentRepository.findByIssueIdOrderByCommentIdAsc(issueId).stream()
                .map(CommentResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public CommentResponse updateComment(Integer issueId, Integer commentId, CommentRequest request) {
        Comment comment = findComment(issueId, commentId);
        comment.setText(request.text().trim());
        comment.setLastUpdated(LocalDate.now(clock));
        return CommentResponse.from(commentRepository.save(comment));
    }

    @Override
    @Transactional
    public void deleteComment(Integer issueId, Integer commentId) {
        commentRepository.delete(findComment(issueId, commentId));
    }

    // ----------------------------------------------------------------- helpers

    private void requireIssue(Integer issueId) {
        if (!issueRepository.existsById(issueId)) {
            throw new ResourceNotFoundException("Issue with ID " + issueId + " not found");
        }
    }

    private Comment findComment(Integer issueId, Integer commentId) {
        requireIssue(issueId);
        return commentRepository.findByCommentIdAndIssueId(commentId, issueId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Comment with ID " + commentId + " not found on issue " + issueId));
    }
}
