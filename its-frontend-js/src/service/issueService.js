import apiService from './apiService';

/** Base URL of issue-service (through the API Gateway). */
const ISSUES_URL = '/api/issues';

/**
 * Calls to issue-service.
 */
const issueService = {
  /** GET /api/issues/owner/{ownerId} - issues of every project the user owns. */
  getIssuesByOwner: (ownerId) => apiService.get(`${ISSUES_URL}/owner/${ownerId}`),
};

export default issueService;
