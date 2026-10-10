/**
 * Project models - mirror the DTOs of project-service
 * (ProjectRequest, ProjectResponse, ProjectCreatedResponse).
 */

/** A project as returned by project-service. */
export interface Project {
  /** Unique project ID. */
  id: number;
  projectName: string;
  /** User ID of the Project Owner. */
  productOwner: number;
  /** Start date, ISO format yyyy-MM-dd. */
  startDate: string;
  /** End date, ISO format yyyy-MM-dd (never before startDate). */
  endDate: string;
}

/** Body of POST /api/projects. */
export interface ProjectRequest {
  projectName: string;
  productOwner: number;
  startDate: string;
  endDate: string;
}

/** Response of POST /api/projects. */
export interface ProjectCreatedResponse {
  message: string;
  projectId: number;
  project: Project;
}
