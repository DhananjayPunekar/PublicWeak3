package com.its.projectservice.service.impl;

import com.its.projectservice.dto.ProjectRequest;
import com.its.projectservice.dto.ProjectResponse;
import com.its.projectservice.dto.UpdateProjectRequest;
import com.its.projectservice.entity.Project;
import com.its.projectservice.exception.DuplicateResourceException;
import com.its.projectservice.exception.InvalidRequestException;
import com.its.projectservice.exception.ResourceNotFoundException;
import com.its.projectservice.repository.ProjectRepository;
import com.its.projectservice.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Default implementation of {@link ProjectService}.
 * <p>
 * Checking that the product owner exists in user-service is added in
 * Milestone 5 (inter-service communication).
 */
@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;

    @Autowired
    public ProjectServiceImpl(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Override
    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        String name = request.projectName().trim();
        if (projectRepository.existsByProjectNameIgnoreCase(name)) {
            throw new DuplicateResourceException("A project named '" + name + "' already exists");
        }
        validateDates(request.startDate(), request.endDate());

        Project project = new Project(name, request.productOwner(), request.startDate(), request.endDate());
        return ProjectResponse.from(projectRepository.save(project));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(ProjectResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Integer projectId) {
        return ProjectResponse.from(findProject(projectId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjectsByOwner(Integer ownerId) {
        return projectRepository.findByProductOwner(ownerId).stream()
                .map(ProjectResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Integer projectId, UpdateProjectRequest request) {
        Project project = findProject(projectId);

        if (request.projectName() != null) {
            String newName = request.projectName().trim();
            if (newName.isEmpty()) {
                throw new InvalidRequestException("Project name must not be blank");
            }
            boolean nameChanged = !newName.equalsIgnoreCase(project.getProjectName());
            if (nameChanged && projectRepository.existsByProjectNameIgnoreCase(newName)) {
                throw new DuplicateResourceException("A project named '" + newName + "' already exists");
            }
            project.setProjectName(newName);
        }

        if (request.productOwner() != null) {
            project.setProductOwner(request.productOwner());
        }

        // Check the dates as they will be after the update (one may be unchanged).
        LocalDate newStart = request.startDate() != null ? request.startDate() : project.getStartDate();
        LocalDate newEnd = request.endDate() != null ? request.endDate() : project.getEndDate();
        validateDates(newStart, newEnd);
        project.setStartDate(newStart);
        project.setEndDate(newEnd);

        return ProjectResponse.from(projectRepository.save(project));
    }

    @Override
    @Transactional
    public void deleteProject(Integer projectId) {
        Project project = findProject(projectId);
        projectRepository.delete(project);
    }

    // ----------------------------------------------------------------- helpers

    private Project findProject(Integer projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project with ID " + projectId + " not found"));
    }

    private static void validateDates(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new InvalidRequestException(
                    "End date (" + endDate + ") must not be before start date (" + startDate + ")");
        }
    }
}
