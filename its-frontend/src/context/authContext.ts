import { createContext } from 'react';
import type { User } from '../models/user';

/** What the authentication context provides to the component tree. */
export interface AuthContextValue {
  /** The logged-in user, or null when nobody is logged in. */
  user: User | null;
  /** Stores the user returned by the login API as the current session. */
  login: (user: User) => void;
  /** Ends the session. */
  logout: () => void;
}

/** Authentication context; use the {@link useAuth} hook to read it. */
export const AuthContext = createContext<AuthContextValue | null>(null);
