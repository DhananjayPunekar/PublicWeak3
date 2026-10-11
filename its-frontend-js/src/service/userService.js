import axios from 'axios';

// user-service, called directly (the service must allow CORS for http://localhost:3000)
const USER_API_URL = 'http://localhost:8081/api/users';

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
    // Show the server's message (e.g. "Invalid email or password") when there is one
    throw new Error(error.response?.data?.message || error.message);
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
    // Show the server's message (e.g. "Invalid email or password") when there is one
    throw new Error(error.response?.data?.message || error.message);
  }
}

/** All users: GET /api/users. */
export async function getAllUsers() {
  try {
    const response = await axios.get(USER_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching users', error);
    // Show the server's message (e.g. "Invalid email or password") when there is one
    throw new Error(error.response?.data?.message || error.message);
  }
}

/** One user: GET /api/users/{userId}. */
export async function getUserById(userId) {
  try {
    const response = await axios.get(`${USER_API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching the user', error);
    // Show the server's message (e.g. "Invalid email or password") when there is one
    throw new Error(error.response?.data?.message || error.message);
  }
}
