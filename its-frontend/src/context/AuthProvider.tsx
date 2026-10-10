import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from './authContext';
import { isRole, type User } from '../models/user';
import { userService } from '../services/userService';
import { ApiError } from '../services/httpClient';

/** sessionStorage key holding the logged-in user (cleared when the tab closes). */
const SESSION_KEY = 'its.session.user';

/** Reads and validates the stored session; returns null if missing or corrupt. */
function readStoredUser(): User | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<User>;
    if (typeof parsed.userId === 'number' && typeof parsed.name === 'string'
      && typeof parsed.email === 'string' && typeof parsed.role === 'string' && isRole(parsed.role)) {
      return {
        userId: parsed.userId,
        name: parsed.name,
        email: parsed.email,
        role: parsed.role,
        profileImage: parsed.profileImage ?? null,
      };
    }
  } catch {
    // Storage unavailable or invalid JSON - treat as logged out.
  }
  return null;
}

/** Props of {@link AuthProvider}. */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Keeps track of the logged-in user and persists it in sessionStorage so a
 * page refresh does not log the user out.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  /** Current user; initialised from sessionStorage once. */
  const [user, setUser] = useState<User | null>(readStoredUser);

  /** Saves the user as the active session. */
  const login = useCallback((loggedIn: User) => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(loggedIn));
    } catch {
      // Storage may be blocked (private mode); the session still works in memory.
    }
    setUser(loggedIn);
  }, []);

  /** Clears the session. */
  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore storage errors on logout.
    }
    setUser(null);
  }, []);

  // On start-up, re-check a restored session with the back end: refresh the
  // stored details, or log out if the account no longer exists. If the server
  // cannot be reached the session is kept (pages show their own errors).
  useEffect(() => {
    const restored = readStoredUser();
    if (!restored) {
      return;
    }
    let active = true;
    userService.getUserById(restored.userId)
      .then((fresh) => {
        if (active && fresh.role === restored.role) {
          login(fresh);
        } else if (active) {
          logout();
        }
      })
      .catch((error: unknown) => {
        if (active && error instanceof ApiError && error.status === 404) {
          logout();
        }
      });
    return () => {
      active = false;
    };
  }, [login, logout]);

  const value = useMemo<AuthContextValue>(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
