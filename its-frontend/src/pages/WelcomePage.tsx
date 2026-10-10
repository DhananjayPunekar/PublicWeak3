import { useNavigate } from 'react-router-dom';
import { useCurrentUser, useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../models/user';
import { PATHS } from '../routes/paths';

/**
 * Temporary landing page after login (Milestone 1).
 * Replaced by the real dashboards in the next milestones.
 */
export function WelcomePage() {
  const user = useCurrentUser();
  const { logout } = useAuth();
  const navigate = useNavigate();

  /** Ends the session and returns to the login page. */
  function handleLogout() {
    logout();
    navigate(PATHS.login, { replace: true });
  }

  return (
    <main className="container py-5 text-center">
      <h1 className="h3">Welcome, {user.name}</h1>
      <p className="text-secondary">Logged in as {ROLE_LABELS[user.role]}. The dashboard is coming in the next milestone.</p>
      <button type="button" className="btn btn-outline-secondary" onClick={handleLogout}>
        Logout
      </button>
    </main>
  );
}
