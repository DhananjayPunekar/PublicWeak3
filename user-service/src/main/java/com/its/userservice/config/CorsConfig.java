package com.its.userservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Allows the React front end (http://localhost:3000) to call this service
 * directly from the browser (CORS).
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    /** Origin of the React development server. */
    private static final String FRONT_END_ORIGIN = "http://localhost:3000";

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(FRONT_END_ORIGIN)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
