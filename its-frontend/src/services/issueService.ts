import { http } from './httpClient';
import { ENDPOINTS } from './endpoints';
import type { Issue } from '../models/issue';

/**
 * Calls to issue-service (through the API Gateway).
 */
export const issueService = {
  /** GET /api/issues/{id} - one issue. */
  getIssueById: (issueId: number) => http.get<Issue>(ENDPOINTS.issue(issueId)),

  /** GET /api/issues/owner/{ownerId} - issues of every project the user owns. */
  getIssuesByOwner: (ownerId: number) => http.get<Issue[]>(ENDPOINTS.issuesByOwner(ownerId)),
};
