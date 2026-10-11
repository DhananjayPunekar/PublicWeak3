import axios from 'axios';
import { getErrorMessage } from './apiService';

// issue-service through the API Gateway ("proxy" in package.json adds host and port)
const ISSUE_API_URL = '/api/issues';

/** Issues of every project a user owns: GET /api/issues/owner/{ownerId}. */
export async function getIssuesByOwner(ownerId) {
  try {
    const response = await axios.get(`${ISSUE_API_URL}/owner/${ownerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching the issues', error);
    throw new Error(getErrorMessage(error));
  }
}
