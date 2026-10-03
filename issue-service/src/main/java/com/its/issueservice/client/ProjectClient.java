package com.its.issueservice.client;

import com.its.issueservice.dto.ProjectDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

/**
 * Feign client for project-service.
 * <p>
 * "project-service" is the name the service registered with in Eureka, so no
 * host or port is hard-coded: Eureka + Spring Cloud LoadBalancer pick an instance.
 */
@FeignClient(name = "project-service")
public interface ProjectClient {

    /** Calls GET /api/projects/owner/{ownerId} on project-service. */
    @GetMapping("/api/projects/owner/{ownerId}")
    List<ProjectDto> getProjectsByOwner(@PathVariable("ownerId") Integer ownerId);
}
