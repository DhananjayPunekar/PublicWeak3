package com.its.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * API Gateway of the Issue Tracking System.
 * <p>
 * The single entry point for clients (port 8080). Requests are routed to
 * user-, project- or issue-service by URL path; the target instance is found
 * in Eureka and chosen by Spring Cloud LoadBalancer (client-side load balancing).
 */
@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
