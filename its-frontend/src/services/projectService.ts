import { http } from './httpClient';
import { ENDPOINTS } from './endpoints';
import type { Issue } from '../models/issue';
import type { Project } from '../models/project';

/**
 * Calls to project-service (through the API Gateway).
 */
export const projectService = {
  /** GET /api/projects/owner/{ownerId} - projects owned by a user. */
  getProjectsByOwner: (ownerId: number) => http.get<Project[]>(ENDPOINTS.projectsByOwner(ownerId)),

  /** GET /api/projects/{projectId} - one project. */
  getProjectById: (projectId: number) => http.get<Project>(ENDPOINTS.project(projectId)),

  /** GET /api/projects/{projectId}/issues - issues of a project (project-service asks issue-service). */
  getProjectIssues: (projectId: number) => http.get<Issue[]>(ENDPOINTS.projectIssues(projectId)),
};
