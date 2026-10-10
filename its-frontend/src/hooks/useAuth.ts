import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../context/authContext';

/** Returns the authentication context. Must be used inside {@link AuthProvider}. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}

/**
 * Returns the logged-in user. Only call this inside a protected route,
 * where a user is guaranteed to exist.
 */
export function useCurrentUser() {
  const { user } = useAuth();
  if (!user) {
    throw new Error('useCurrentUser called without a logged-in user');
  }
  return user;
}
