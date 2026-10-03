package com.its.projectservice.service.impl;

import com.its.projectservice.dto.ProjectRequest;
import com.its.projectservice.dto.ProjectResponse;
import com.its.projectservice.dto.UpdateProjectRequest;
import com.its.projectservice.entity.Project;
import com.its.projectservice.exception.DuplicateResourceException;
import com.its.projectservice.exception.InvalidRequestException;
import com.its.projectservice.exception.ResourceNotFoundException;
import com.its.projectservice.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link ProjectServiceImpl}. The repository is mocked.
 */
@ExtendWith(MockitoExtension.class)
class ProjectServiceImplTest {

    private static final LocalDate JAN_1 = LocalDate.of(2026, 1, 1);
    private static final LocalDate DEC_31 = LocalDate.of(2026, 12, 31);

    @Mock
    private ProjectRepository projectRepository;

    private ProjectServiceImpl projectService;

    @BeforeEach
    void setUp() {
        projectService = new ProjectServiceImpl(projectRepository);
    }

    private Project existingProject(int id, String name) {
        Project project = new Project(name, 1, JAN_1, DEC_31);
        project.setId(id);
        return project;
    }

    @Test
    void createProject_savesTrimmedNameAndReturnsId() {
        when(projectRepository.existsByProjectNameIgnoreCase("Project Zeta")).thenReturn(false);
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project saved = invocation.getArgument(0);
            saved.setId(106);
            return saved;
        });

        ProjectResponse response = projectService.createProject(
                new ProjectRequest("  Project Zeta ", 1, JAN_1, DEC_31));

        ArgumentCaptor<Project> captor = ArgumentCaptor.forClass(Project.class);
        verify(projectRepository).save(captor.capture());
        assertThat(captor.getValue().getProjectName()).isEqualTo("Project Zeta");
        assertThat(response.id()).isEqualTo(106);
        assertThat(response.productOwner()).isEqualTo(1);
    }

    @Test
    void createProject_withExistingName_throwsDuplicate() {
        when(projectRepository.existsByProjectNameIgnoreCase("Project Alpha")).thenReturn(true);

        assertThatThrownBy(() -> projectService.createProject(
                new ProjectRequest("Project Alpha", 1, JAN_1, DEC_31)))
                .isInstanceOf(DuplicateResourceException.class);
        verify(projectRepository, never()).save(any());
    }

    @Test
    void createProject_withEndBeforeStart_throwsInvalidRequest() {
        when(projectRepository.existsByProjectNameIgnoreCase("Backwards")).thenReturn(false);

        assertThatThrownBy(() -> projectService.createProject(
                new ProjectRequest("Backwards", 1, DEC_31, JAN_1)))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("must not be before start date");
        verify(projectRepository, never()).save(any());
    }

    @Test
    void createProject_withSameStartAndEnd_isAllowed() {
        when(projectRepository.existsByProjectNameIgnoreCase("One Day")).thenReturn(false);
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProjectResponse response = projectService.createProject(new ProjectRequest("One Day", 1, JAN_1, JAN_1));

        assertThat(response.startDate()).isEqualTo(response.endDate());
    }

    @Test
    void getProjectById_whenMissing_throwsNotFound() {
        when(projectRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.getProjectById(999))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Project with ID 999 not found");
    }

    @Test
    void getProjectsByOwner_returnsOwnersProjects() {
        when(projectRepository.findByProductOwner(1))
                .thenReturn(List.of(existingProject(101, "Project Alpha")));

        List<ProjectResponse> projects = projectService.getProjectsByOwner(1);

        assertThat(projects).extracting(ProjectResponse::projectName).containsExactly("Project Alpha");
    }

    @Test
    void updateProject_changesOnlyProvidedFields() {
        Project project = existingProject(101, "Project Alpha");
        when(projectRepository.findById(101)).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LocalDate newEnd = LocalDate.of(2027, 6, 30);
        ProjectResponse response = projectService.updateProject(101,
                new UpdateProjectRequest(null, 4, null, newEnd));

        assertThat(response.projectName()).isEqualTo("Project Alpha");
        assertThat(response.productOwner()).isEqualTo(4);
        assertThat(response.startDate()).isEqualTo(JAN_1);
        assertThat(response.endDate()).isEqualTo(newEnd);
    }

    @Test
    void updateProject_withStartAfterExistingEnd_throwsInvalidRequest() {
        Project project = existingProject(101, "Project Alpha");
        when(projectRepository.findById(101)).thenReturn(Optional.of(project));

        assertThatThrownBy(() -> projectService.updateProject(101,
                new UpdateProjectRequest(null, null, LocalDate.of(2027, 1, 1), null)))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void updateProject_toNameUsedByAnotherProject_throwsDuplicate() {
        Project project = existingProject(101, "Project Alpha");
        when(projectRepository.findById(101)).thenReturn(Optional.of(project));
        when(projectRepository.existsByProjectNameIgnoreCase("Project Beta")).thenReturn(true);

        assertThatThrownBy(() -> projectService.updateProject(101,
                new UpdateProjectRequest("Project Beta", null, null, null)))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void deleteProject_whenMissing_throwsNotFound() {
        when(projectRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.deleteProject(999))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(projectRepository, never()).delete(any());
    }
}
