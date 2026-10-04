package com.its.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Routing rules of the API Gateway.
 * <p>
 * Each request path is forwarded unchanged to the service that owns it.
 * "lb://service-name" means: look the service up in Eureka and pick an
 * instance with Spring Cloud LoadBalancer (round robin when several run).
 *
 * <pre>
 *   /api/users/**     →  user-service     (8081)
 *   /api/projects/**  →  project-service  (8082)
 *   /api/issues/**    →  issue-service    (8083)
 * </pre>
 */
@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouteLocator itsRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-service", r -> r.path("/api/users", "/api/users/**")
                        .uri("lb://user-service"))
                .route("project-service", r -> r.path("/api/projects", "/api/projects/**")
                        .uri("lb://project-service"))
                .route("issue-service", r -> r.path("/api/issues", "/api/issues/**")
                        .uri("lb://issue-service"))
                .build();
    }
}
