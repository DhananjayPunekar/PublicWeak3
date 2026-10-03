package com.its.issueservice.repository;

import com.its.issueservice.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Data access for the {@code comments} table.
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {

    /** Comments of an issue, oldest first. */
    List<Comment> findByIssueIdOrderByCommentIdAsc(Integer issueId);

    /** A comment, only if it belongs to the given issue. */
    Optional<Comment> findByCommentIdAndIssueId(Integer commentId, Integer issueId);
}
