package com.its.projectservice.repository;

import com.its.projectservice.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Data access for the {@code projects} table.
 * Spring Data JPA generates the implementation from the method names.
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Integer> {

    List<Project> findByProductOwner(Integer productOwner);

    Optional<Project> findByProjectNameIgnoreCase(String projectName);

    boolean existsByProjectNameIgnoreCase(String projectName);
}
