import { http } from './httpClient';
import { ENDPOINTS } from './endpoints';
import type { LoginRequest, LoginResponse, SignUpRequest, SignUpResponse, User } from '../models/user';
import type { Issue } from '../models/issue';

/**
 * Calls to user-service (through the API Gateway).
 */
export const userService = {
  /** POST /api/users/login - checks the email and password. */
  login: (request: LoginRequest) => http.post<LoginResponse>(ENDPOINTS.login, request),

  /** POST /api/users - creates a new account. */
  signUp: (request: SignUpRequest) => http.post<SignUpResponse>(ENDPOINTS.users, request),

  /** GET /api/users - every registered user. */
  getAllUsers: () => http.get<User[]>(ENDPOINTS.users),

  /** GET /api/users/{userId} - one user. */
  getUserById: (userId: number) => http.get<User>(ENDPOINTS.user(userId)),

  /** GET /api/users/{userId}/issues - issues assigned to the user (user-service asks issue-service). */
  getAssignedIssues: (userId: number) => http.get<Issue[]>(ENDPOINTS.userIssues(userId)),
};
