import { useCallback } from 'react';
import { useApi } from './useApi';
import { issueService } from '../services/issueService';
import { projectService } from '../services/projectService';
import { ApiError } from '../services/httpClient';
import type { Issue } from '../models/issue';
import type { Project } from '../models/project';

/** An issue together with its project (null if the project no longer exists). */
export interface IssueWithProject {
  issue: Issue;
  project: Project | null;
}

/**
 * Loads an issue and then its project. A missing project (404) is not an
 * error for the screen - the issue is still shown.
 */
export function useIssueWithProject(issueId: number) {
  const loader = useCallback(async (): Promise<IssueWithProject> => {
    if (!Number.isInteger(issueId) || issueId <= 0) {
      throw new ApiError(404, 'Invalid issue ID');
    }
    const issue = await issueService.getIssueById(issueId);
    try {
      const project = await projectService.getProjectById(issue.project);
      return { issue, project };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return { issue, project: null };
      }
      throw error;
    }
  }, [issueId]);
  return useApi(loader);
}
