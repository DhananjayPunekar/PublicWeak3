import apiService from './apiService';

/** Base URL of project-service (through the API Gateway). */
const PROJECTS_URL = '/api/projects';

/**
 * Calls to project-service.
 */
const projectService = {
  /** GET /api/projects/owner/{ownerId} - projects owned by a user. */
  getProjectsByOwner: (ownerId) => apiService.get(`${PROJECTS_URL}/owner/${ownerId}`),

  /** GET /api/projects/{projectId}/issues - issues of a project (project-service asks issue-service). */
  getProjectIssues: (projectId) => apiService.get(`${PROJECTS_URL}/${projectId}/issues`),
};

export default projectService;
