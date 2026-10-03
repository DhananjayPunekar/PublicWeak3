package com.its.userservice.client;

import com.its.userservice.dto.ProjectDto;
import com.its.userservice.exception.ServiceUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Calls project-service with a {@link RestTemplate} (User → Project in the
 * architecture diagram).
 * <p>
 * The URL uses the Eureka service name "project-service" instead of
 * host:port; the {@code @LoadBalanced} RestTemplate resolves it.
 */
@Component
public class ProjectClient {

    private static final Logger log = LoggerFactory.getLogger(ProjectClient.class);

    static final String PROJECTS_BY_OWNER_URL = "http://project-service/api/projects/owner/{ownerId}";

    private final RestTemplate restTemplate;

    @Autowired
    public ProjectClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Calls GET /api/projects/owner/{ownerId} on project-service.
     *
     * @throws ServiceUnavailableException if project-service can't be reached
     */
    public List<ProjectDto> getProjectsByOwner(Integer ownerId) {
        try {
            ProjectDto[] projects = restTemplate.getForObject(PROJECTS_BY_OWNER_URL, ProjectDto[].class, ownerId);
            return projects == null ? List.of() : List.of(projects);
        } catch (RestClientException | IllegalStateException ex) {
            // IllegalStateException: no instance of project-service registered in Eureka
            log.warn("Call to project-service failed: {}", ex.getMessage());
            throw new ServiceUnavailableException("Project service is not available right now. Please try again later.", ex);
        }
    }
}
