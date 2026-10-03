package com.its.userservice.client;

import com.its.userservice.dto.ProjectDto;
import com.its.userservice.exception.ServiceUnavailableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the RestTemplate-based {@link ProjectClient}.
 */
@ExtendWith(MockitoExtension.class)
class ProjectClientTest {

    @Mock
    private RestTemplate restTemplate;

    private ProjectClient projectClient;

    @BeforeEach
    void setUp() {
        projectClient = new ProjectClient(restTemplate);
    }

    @Test
    void getProjectsByOwner_callsProjectServiceByEurekaName() {
        ProjectDto alpha = new ProjectDto(101, "Project Alpha", 1, LocalDate.of(2023, 1, 1), LocalDate.of(2023, 12, 31));
        when(restTemplate.getForObject(eq("http://project-service/api/projects/owner/{ownerId}"),
                eq(ProjectDto[].class), eq(1)))
                .thenReturn(new ProjectDto[]{alpha});

        assertThat(projectClient.getProjectsByOwner(1)).containsExactly(alpha);
    }

    @Test
    void getProjectsByOwner_whenProjectServiceDown_throwsServiceUnavailable() {
        when(restTemplate.getForObject(eq(ProjectClient.PROJECTS_BY_OWNER_URL), eq(ProjectDto[].class), eq(1)))
                .thenThrow(new ResourceAccessException("Connection refused"));

        assertThatThrownBy(() -> projectClient.getProjectsByOwner(1))
                .isInstanceOf(ServiceUnavailableException.class)
                .hasMessageContaining("Project service is not available");
    }
}
