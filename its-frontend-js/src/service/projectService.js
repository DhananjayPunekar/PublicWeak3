import axios from 'axios';

// project-service, called directly (the service must allow CORS for http://localhost:3000)
const PROJECT_API_URL = 'http://localhost:8082/api/projects';

/** Projects owned by a user: GET /api/projects/owner/{ownerId}. */
export async function getProjectsByOwner(ownerId) {
  try {
    const response = await axios.get(`${PROJECT_API_URL}/owner/${ownerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching the projects', error);
    // Show the server's message (e.g. "Invalid email or password") when there is one
    throw new Error(error.response?.data?.message || error.message);
  }
}

/** Issues of a project: GET /api/projects/{projectId}/issues. */
export async function getProjectIssues(projectId) {
  try {
    const response = await axios.get(`${PROJECT_API_URL}/${projectId}/issues`);
    return response.data;
  } catch (error) {
    console.error('Error fetching the project issues', error);
    // Show the server's message (e.g. "Invalid email or password") when there is one
    throw new Error(error.response?.data?.message || error.message);
  }
}

/** Create a project: POST /api/projects - returns { message, projectId, project }. */
export async function createProject(project) {
  try {
    const response = await axios.post(PROJECT_API_URL, {
      projectName: project.projectName,
      productOwner: project.productOwner,
      startDate: project.startDate,
      endDate: project.endDate,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating the project', error);
    // Show the server's message (e.g. "A project named 'X' already exists") when there is one
    throw new Error(error.response?.data?.message || error.message);
  }
}
