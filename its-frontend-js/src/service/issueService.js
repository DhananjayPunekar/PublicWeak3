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

/** Create an issue: POST /api/issues - returns { message, issueId, issue }. */
export async function createIssue(issue) {
  try {
    const response = await axios.post(ISSUE_API_URL, {
      summary: issue.summary,
      type: issue.type,
      project: issue.project,
      description: issue.description,
      priority: issue.priority,
      assignee: issue.assignee,
      createdBy: issue.createdBy,
      tags: issue.tags,
      sprint: issue.sprint,
      storyPoint: issue.storyPoint,
      status: issue.status,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating the issue', error);
    // Show the server's message when there is one
    throw new Error(error.response?.data?.message || error.message);
  }
}

/** One issue: GET /api/issues/{issueId}. */
export async function getIssueById(issueId) {
  try {
    const response = await axios.get(`${ISSUE_API_URL}/${issueId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching the issue', error);
    throw new Error(error.response?.data?.message || error.message);
  }
}

/** Update an issue: PUT /api/issues/{issueId} - returns the updated issue. */
export async function updateIssue(issueId, issue) {
  try {
    const response = await axios.put(`${ISSUE_API_URL}/${issueId}`, {
      summary: issue.summary,
      type: issue.type,
      project: issue.project,
      description: issue.description,
      priority: issue.priority,
      assignee: issue.assignee,
      tags: issue.tags,
      sprint: issue.sprint,
      storyPoint: issue.storyPoint,
      status: issue.status,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating the issue', error);
    throw new Error(error.response?.data?.message || error.message);
  }
}
