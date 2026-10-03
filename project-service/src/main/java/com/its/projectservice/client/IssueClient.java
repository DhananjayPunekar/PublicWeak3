package com.its.projectservice.client;

import com.its.projectservice.dto.IssueDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

/**
 * Feign client for issue-service.
 * <p>
 * "issue-service" is the name the service registered with in Eureka, so no
 * host or port is hard-coded: Eureka + Spring Cloud LoadBalancer pick an instance.
 */
@FeignClient(name = "issue-service")
public interface IssueClient {

    /** Calls GET /api/issues/project/{projectId} on issue-service. */
    @GetMapping("/api/issues/project/{projectId}")
    List<IssueDto> getIssuesByProject(@PathVariable("projectId") Integer projectId);
}
