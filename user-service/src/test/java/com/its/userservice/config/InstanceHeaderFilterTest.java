package com.its.userservice.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Checks that every response says which instance served it.
 */
class InstanceHeaderFilterTest {

    @Test
    void addsServedByHeaderWithServiceNameAndPort() throws Exception {
        InstanceHeaderFilter filter = new InstanceHeaderFilter("user-service", "8091");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(new MockHttpServletRequest("GET", "/api/users"), response, new MockFilterChain());

        assertThat(response.getHeader("X-Served-By")).isEqualTo("user-service:8091");
    }
}
