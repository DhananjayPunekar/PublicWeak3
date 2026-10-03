package com.its.projectservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger / OpenAPI metadata. UI available at /swagger-ui.html.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI projectServiceOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Project Service API")
                .description("Issue Tracking System - project creation and management")
                .version("v1"));
    }
}
