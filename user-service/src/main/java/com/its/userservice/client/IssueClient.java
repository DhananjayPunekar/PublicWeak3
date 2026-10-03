package com.its.userservice.client;

import com.its.userservice.dto.IssueDto;
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

    /** Calls GET /api/issues/assignee/{assigneeId} on issue-service. */
    @GetMapping("/api/issues/assignee/{assigneeId}")
    List<IssueDto> getIssuesByAssignee(@PathVariable("assigneeId") Integer assigneeId);
}
