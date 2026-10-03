package com.its.issueservice.service.impl;

import com.its.issueservice.dto.CommentRequest;
import com.its.issueservice.dto.CommentResponse;
import com.its.issueservice.entity.Comment;
import com.its.issueservice.exception.ResourceNotFoundException;
import com.its.issueservice.repository.CommentRepository;
import com.its.issueservice.repository.IssueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link CommentServiceImpl}.
 */
@ExtendWith(MockitoExtension.class)
class CommentServiceImplTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 10, 3);
    private static final Clock FIXED_CLOCK =
            Clock.fixed(TODAY.atStartOfDay(ZoneId.of("UTC")).toInstant(), ZoneId.of("UTC"));

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private IssueRepository issueRepository;

    private CommentServiceImpl commentService;

    @BeforeEach
    void setUp() {
        commentService = new CommentServiceImpl(commentRepository, issueRepository, FIXED_CLOCK);
    }

    @Test
    void addComment_savesTrimmedTextWithToday() {
        when(issueRepository.existsById(201)).thenReturn(true);
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> {
            Comment saved = invocation.getArgument(0);
            saved.setCommentId(1);
            return saved;
        });

        CommentResponse response = commentService.addComment(201, new CommentRequest("  Looks good  "));

        assertThat(response.commentId()).isEqualTo(1);
        assertThat(response.issueId()).isEqualTo(201);
        assertThat(response.text()).isEqualTo("Looks good");
        assertThat(response.createdDate()).isEqualTo(TODAY);
    }

    @Test
    void addComment_toMissingIssue_throwsNotFound() {
        when(issueRepository.existsById(999)).thenReturn(false);

        assertThatThrownBy(() -> commentService.addComment(999, new CommentRequest("Hi")))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Issue with ID 999 not found");
        verify(commentRepository, never()).save(any());
    }

    @Test
    void updateComment_onAnotherIssue_throwsNotFound() {
        when(issueRepository.existsById(201)).thenReturn(true);
        when(commentRepository.findByCommentIdAndIssueId(5, 201)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.updateComment(201, 5, new CommentRequest("Edited")))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Comment with ID 5 not found on issue 201");
    }

    @Test
    void updateComment_changesTextAndLastUpdated() {
        Comment comment = new Comment(201, "Old", LocalDate.of(2026, 1, 1));
        comment.setCommentId(5);
        when(issueRepository.existsById(201)).thenReturn(true);
        when(commentRepository.findByCommentIdAndIssueId(5, 201)).thenReturn(Optional.of(comment));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CommentResponse response = commentService.updateComment(201, 5, new CommentRequest("New"));

        assertThat(response.text()).isEqualTo("New");
        assertThat(response.createdDate()).isEqualTo(LocalDate.of(2026, 1, 1));
        assertThat(response.lastUpdated()).isEqualTo(TODAY);
    }
}
