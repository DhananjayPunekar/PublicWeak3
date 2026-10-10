import type { Role } from '../models/user';

/** Every route of the application, so links never use hard-coded strings. */
export const PATHS = {
  login: '/login',
  signup: '/signup',
  ownerDashboard: '/owner/dashboard',
  createProject: '/owner/projects/new',
  createIssue: '/owner/issues/new',
  ownerIssue: (issueId: number | string) => `/owner/issues/${issueId}`,
  editIssue: (issueId: number | string) => `/owner/issues/${issueId}/edit`,
  assigneeDashboard: '/assignee/dashboard',
  assigneeIssue: (issueId: number | string) => `/assignee/issues/${issueId}`,
} as const;

/** Dashboard a user lands on after login, based on their role. */
export function homePathFor(role: Role): string {
  return role === 'productOwner' ? PATHS.ownerDashboard : PATHS.assigneeDashboard;
}
