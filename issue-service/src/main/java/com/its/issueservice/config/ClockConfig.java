package com.its.issueservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

/**
 * Provides the clock used for "created on" / "last updated" dates.
 * Injecting a Clock (instead of calling LocalDate.now() directly)
 * lets the unit tests use a fixed date.
 */
@Configuration
public class ClockConfig {

    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }
}
