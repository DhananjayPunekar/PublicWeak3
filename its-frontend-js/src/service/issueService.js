import axios from 'axios';

// issue-service, called directly (the service must allow CORS for http://localhost:3000)
const ISSUE_API_URL = 'http://localhost:8083/api/issues';

/** Issues of every project a user owns: GET /api/issues/owner/{ownerId}. */
export async function getIssuesByOwner(ownerId) {
  try {
    const response = await axios.get(`${ISSUE_API_URL}/owner/${ownerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching the issues', error);
    // Show the server's message (e.g. "Invalid email or password") when there is one
    throw new Error(error.response?.data?.message || error.message);
  }
}
