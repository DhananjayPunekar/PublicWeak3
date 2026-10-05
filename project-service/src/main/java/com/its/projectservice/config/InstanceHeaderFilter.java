package com.its.projectservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Adds an "X-Served-By" header (e.g. "user-service:8091") to every response
 * and logs each request, so you can see which instance handled it.
 * <p>
 * Used to test load balancing: with two instances of this service running,
 * requests through the API Gateway alternate between them.
 */
@Component
public class InstanceHeaderFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(InstanceHeaderFilter.class);

    static final String HEADER = "X-Served-By";

    private final String instance;

    public InstanceHeaderFilter(@Value("${spring.application.name}") String applicationName,
                                @Value("${server.port}") String port) {
        this.instance = applicationName + ":" + port;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        response.setHeader(HEADER, instance);
        log.info("{} handled {} {}", instance, request.getMethod(), request.getRequestURI());
        chain.doFilter(request, response);
    }
}
