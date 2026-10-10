import { useMemo } from 'react';
import { useApi } from './useApi';
import { userService } from '../services/userService';
import type { User } from '../models/user';

/** Loader passed to useApi (module level, so it never changes). */
const loadUsers = () => userService.getAllUsers();

/**
 * Loads every user once and offers a lookup by ID
 * (used to show assignee names and photos).
 */
export function useUsers() {
  const { data, loading, error, reload } = useApi(loadUsers);
  /** Users by ID for quick lookups. */
  const usersById = useMemo(() => new Map<number, User>((data ?? []).map((user) => [user.userId, user])), [data]);
  return { users: data ?? [], usersById, loading, error, reload };
}
