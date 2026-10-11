import axios from 'axios';
import { getErrorMessage } from './apiService';

// project-service through the API Gateway ("proxy" in package.json adds host and port)
const PROJECT_API_URL = '/api/projects';

/** Projects owned by a user: GET /api/projects/owner/{ownerId}. */
export async function getProjectsByOwner(ownerId) {
  try {
    const response = await axios.get(`${PROJECT_API_URL}/owner/${ownerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching the projects', error);
    throw new Error(getErrorMessage(error));
  }
}

/** Issues of a project: GET /api/projects/{projectId}/issues. */
export async function getProjectIssues(projectId) {
  try {
    const response = await axios.get(`${PROJECT_API_URL}/${projectId}/issues`);
    return response.data;
  } catch (error) {
    console.error('Error fetching the project issues', error);
    throw new Error(getErrorMessage(error));
  }
}
