/**
 * Every back-end endpoint used by the UI, in one place.
 * All calls go through the API Gateway, which routes /api/users/**,
 * /api/projects/** and /api/issues/** to the matching microservice.
 */
export const ENDPOINTS = {
  // user-service
  users: '/api/users',
  login: '/api/users/login',
  user: (userId: number) => `/api/users/${userId}`,
  userIssues: (userId: number) => `/api/users/${userId}/issues`,

  // project-service
  projects: '/api/projects',
  project: (projectId: number) => `/api/projects/${projectId}`,
  projectIssues: (projectId: number) => `/api/projects/${projectId}/issues`,
  projectsByOwner: (ownerId: number) => `/api/projects/owner/${ownerId}`,

  // issue-service
  issues: '/api/issues',
  issue: (issueId: number) => `/api/issues/${issueId}`,
  issueStatus: (issueId: number) => `/api/issues/${issueId}/status`,
  issuesByOwner: (ownerId: number) => `/api/issues/owner/${ownerId}`,
  issuesByAssignee: (assigneeId: number) => `/api/issues/assignee/${assigneeId}`,
} as const;
