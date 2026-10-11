import axios from 'axios';
import { getErrorMessage } from './apiService';

// user-service through the API Gateway ("proxy" in package.json adds host and port)
const USER_API_URL = '/api/users';

/** Login: POST /api/users/login - returns { message, dashboard, user }. */
export async function loginUser(email, password) {
  try {
    const response = await axios.post(`${USER_API_URL}/login`, {
      email: email,
      password: password,
    });
    return response.data;
  } catch (error) {
    console.error('Error logging in the user', error);
    throw new Error(getErrorMessage(error));
  }
}

/** Signup: POST /api/users - returns { message, loginUrl, user }. */
export async function registerUser(user) {
  try {
    const response = await axios.post(USER_API_URL, {
      name: user.name,
      email: user.email,
      password: user.password,
      profileImage: user.profileImage,
      role: user.role,
    });
    return response.data;
  } catch (error) {
    console.error('Error registering the user', error);
    throw new Error(getErrorMessage(error));
  }
}

/** All users: GET /api/users. */
export async function getAllUsers() {
  try {
    const response = await axios.get(USER_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching users', error);
    throw new Error(getErrorMessage(error));
  }
}

/** One user: GET /api/users/{userId}. */
export async function getUserById(userId) {
  try {
    const response = await axios.get(`${USER_API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching the user', error);
    throw new Error(getErrorMessage(error));
  }
}
