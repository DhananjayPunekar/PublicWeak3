import { http } from './httpClient';
import { ENDPOINTS } from './endpoints';
import type { LoginRequest, LoginResponse, SignUpRequest, SignUpResponse, User } from '../models/user';

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
};
