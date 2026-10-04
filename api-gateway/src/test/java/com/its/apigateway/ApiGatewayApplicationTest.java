package com.its.apigateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Starts the gateway (without Eureka) and checks the three routes exist
 * and point at the right services.
 */
@SpringBootTest(properties = "eureka.client.enabled=false")
class ApiGatewayApplicationTest {

    @Autowired
    private RouteLocator routeLocator;

    @Test
    void routesPointToTheThreeServices() {
        List<Route> routes = routeLocator.getRoutes().collectList().block();

        assertThat(routes)
                .extracting(Route::getId)
                .containsExactlyInAnyOrder("user-service", "project-service", "issue-service");
        assertThat(routes)
                .extracting(route -> route.getUri().toString())
                .containsExactlyInAnyOrder("lb://user-service", "lb://project-service", "lb://issue-service");
    }
}
