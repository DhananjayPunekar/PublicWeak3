import apiService from './apiService';

/** Base URL of user-service (through the API Gateway). */
const USERS_URL = '/api/users';

/**
 * Calls to user-service.
 */
const userService = {
  /** POST /api/users/login - returns { message, dashboard, user }. */
  login: (email, password) => apiService.post(`${USERS_URL}/login`, { email, password }),

  /** POST /api/users - creates an account; returns { message, loginUrl, user }. */
  signup: (newUser) => apiService.post(USERS_URL, newUser),

  /** GET /api/users - every user. */
  getAllUsers: () => apiService.get(USERS_URL),

  /** GET /api/users/{userId} - one user. */
  getUserById: (userId) => apiService.get(`${USERS_URL}/${userId}`),
};

export default userService;
