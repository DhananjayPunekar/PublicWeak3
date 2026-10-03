package com.its.issueservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point of the Issue microservice.
 * <p>
 * Responsible for issues within projects
 * (issues table in the issue_db database).
 */
@SpringBootApplication
public class IssueServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(IssueServiceApplication.class, args);
    }
}
