/**
 * Every back-end endpoint used by the UI, in one place.
 * All calls go through the API Gateway, which routes /api/users/**,
 * /api/projects/** and /api/issues/** to the matching microservice.
 */
export const ENDPOINTS = {
  users: '/api/users',
  login: '/api/users/login',
  user: (userId: number) => `/api/users/${userId}`,
  userIssues: (userId: number) => `/api/users/${userId}/issues`,
} as const;
