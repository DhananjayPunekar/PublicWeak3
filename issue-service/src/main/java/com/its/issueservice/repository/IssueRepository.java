package com.its.issueservice.repository;

import com.its.issueservice.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

/**
 * Data access for the {@code issues} table.
 * Spring Data JPA generates the implementation from the method names.
 */
@Repository
public interface IssueRepository extends JpaRepository<Issue, Integer> {

    List<Issue> findByProject(Integer projectId);

    List<Issue> findByAssignee(Integer assigneeId);

    /** Issues of several projects at once (used for "issues owned by a user" in Milestone 5). */
    List<Issue> findByProjectIn(Collection<Integer> projectIds);
}
