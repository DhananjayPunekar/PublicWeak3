package com.its.issueservice.config;

import com.its.issueservice.client.ProjectClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Configuration;

/**
 * Turns on Feign clients (the interfaces in the client package).
 * <p>
 * Kept in its own configuration class rather than on the main class, so the
 * {@code @WebMvcTest} controller tests don't try to create Feign clients.
 */
@Configuration
@EnableFeignClients(basePackageClasses = ProjectClient.class)
public class FeignConfig {
}
