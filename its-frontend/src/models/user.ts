/**
 * User models - mirror the DTOs of user-service
 * (SignUpRequest, LoginRequest, LoginResponse, SignUpResponse, UserResponse).
 */

/** Role values exactly as user-service sends and accepts them. */
export type Role = 'productOwner' | 'assignee';

/** Every role, in the order shown in drop-downs. */
export const ROLES: readonly Role[] = ['productOwner', 'assignee'];

/** Human-friendly label for each role, shown in the UI. */
export const ROLE_LABELS: Record<Role, string> = {
  productOwner: 'Project Owner',
  assignee: 'Assignee',
};

/** A user as returned by user-service (never contains the password). */
export interface User {
  /** Unique user ID. */
  userId: number;
  /** Display name. */
  name: string;
  /** Email address, used to log in. */
  email: string;
  /** Project Owner or Assignee. */
  role: Role;
  /** URL of the profile image (may be missing for older accounts). */
  profileImage: string | null;
}

/** Body of POST /api/users/login. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Response of POST /api/users/login. */
export interface LoginResponse {
  message: string;
  /** Dashboard the back end suggests for the user's role. */
  dashboard: string;
  user: User;
}

/** Body of POST /api/users (sign up). */
export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  profileImage: string;
  role: Role;
}

/** Response of POST /api/users (sign up). */
export interface SignUpResponse {
  /** "Your account is created successfully". */
  message: string;
  /** Link to the login endpoint. */
  loginUrl: string;
  user: User;
}

/** Type guard: true if the text is a valid {@link Role}. */
export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}
