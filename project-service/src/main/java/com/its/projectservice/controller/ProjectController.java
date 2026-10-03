package com.its.projectservice.controller;

import com.its.projectservice.dto.MessageResponse;
import com.its.projectservice.dto.ProjectCreatedResponse;
import com.its.projectservice.dto.ProjectRequest;
import com.its.projectservice.dto.ProjectResponse;
import com.its.projectservice.dto.UpdateProjectRequest;
import com.its.projectservice.exception.ApiError;
import com.its.projectservice.service.ProjectService;
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
 * REST endpoints of the Project Service.
 * Every method returns a {@link ResponseEntity} so the HTTP status is explicit.
 */
@RestController
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "Project creation and management (Project Owner view)")
public class ProjectController {

    static final String CREATED_MESSAGE = "Project created successfully";

    private final ProjectService projectService;

    @Autowired
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @Operation(summary = "Create a new project")
    @ApiResponse(responseCode = "201", description = "Project created")
    @ApiResponse(responseCode = "400", description = "Invalid input or end date before start date",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "409", description = "Project name already exists",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @PostMapping
    public ResponseEntity<ProjectCreatedResponse> createProject(@Valid @RequestBody ProjectRequest request) {
        ProjectResponse project = projectService.createProject(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{projectId}")
                .buildAndExpand(project.id())
                .toUri();

        return ResponseEntity.created(location)
                .body(new ProjectCreatedResponse(CREATED_MESSAGE, project.id(), project));
    }

    @Operation(summary = "Get all projects")
    @ApiResponse(responseCode = "200", description = "List of projects")
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @Operation(summary = "Get a project by ID")
    @ApiResponse(responseCode = "200", description = "Project found")
    @ApiResponse(responseCode = "404", description = "Project not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Integer projectId) {
        return ResponseEntity.ok(projectService.getProjectById(projectId));
    }

    @Operation(summary = "Get projects owned by a user",
            description = "Returns an empty list if the user owns no projects.")
    @ApiResponse(responseCode = "200", description = "List of projects")
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByOwner(@PathVariable Integer ownerId) {
        return ResponseEntity.ok(projectService.getProjectsByOwner(ownerId));
    }

    @Operation(summary = "Update a project", description = "Only the fields present in the body are changed.")
    @ApiResponse(responseCode = "200", description = "Project updated")
    @ApiResponse(responseCode = "400", description = "Invalid input or end date before start date",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "404", description = "Project not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "409", description = "Project name already exists",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable Integer projectId,
                                                         @Valid @RequestBody UpdateProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(projectId, request));
    }

    @Operation(summary = "Delete a project")
    @ApiResponse(responseCode = "200", description = "Project deleted")
    @ApiResponse(responseCode = "404", description = "Project not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @DeleteMapping("/{projectId}")
    public ResponseEntity<MessageResponse> deleteProject(@PathVariable Integer projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok(new MessageResponse("Project with ID " + projectId + " deleted successfully"));
    }
}
