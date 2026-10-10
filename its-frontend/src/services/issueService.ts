import { http } from './httpClient';
import { ENDPOINTS } from './endpoints';
import type { Issue, IssueCreatedResponse, IssueRequest, UpdateIssueRequest } from '../models/issue';

/**
 * Calls to issue-service (through the API Gateway).
 */
export const issueService = {
  /** GET /api/issues/{id} - one issue. */
  getIssueById: (issueId: number) => http.get<Issue>(ENDPOINTS.issue(issueId)),

  /** GET /api/issues/owner/{ownerId} - issues of every project the user owns. */
  getIssuesByOwner: (ownerId: number) => http.get<Issue[]>(ENDPOINTS.issuesByOwner(ownerId)),

  /** POST /api/issues - creates an issue and returns its ID. */
  createIssue: (request: IssueRequest) => http.post<IssueCreatedResponse>(ENDPOINTS.issues, request),

  /** PUT /api/issues/{id} - updates the given fields (Project Owner). */
  updateIssue: (issueId: number, request: UpdateIssueRequest) => http.put<Issue>(ENDPOINTS.issue(issueId), request),
};
