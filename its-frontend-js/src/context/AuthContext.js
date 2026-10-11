import { createContext, useState } from 'react';

/** Key used to keep the logged-in user in sessionStorage (cleared when the tab closes). */
const STORAGE_KEY = 'its-user';

/** Reads the saved user, or null when nobody is logged in. */
function readSavedUser() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/** Shares the logged-in user with every component: { user, login, logout }. */
export const AuthContext = createContext(null);

/**
 * Keeps the logged-in user (as returned by the login API) and saves it in
 * sessionStorage so a page refresh does not log the user out.
 */
export function AuthProvider({ children }) {
  // Logged-in user: { userId, name, email, role, profileImage } or null
  const [user, setUser] = useState(readSavedUser);

  /** Starts a session for the user returned by the login API. */
  function login(loggedInUser) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }

  /** Ends the session. */
  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
