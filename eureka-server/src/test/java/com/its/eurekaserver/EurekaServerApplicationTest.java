package com.its.eurekaserver;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Checks that the Eureka server's Spring context starts.
 * Needs no database or other services.
 */
@SpringBootTest
class EurekaServerApplicationTest {

    @Test
    void contextLoads() {
        // fails if the application context cannot start
    }
}
