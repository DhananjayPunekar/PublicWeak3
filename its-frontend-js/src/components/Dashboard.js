import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getRoleLabel } from '../model/User';

/**
 * Landing page after login (Milestone 1).
 * The real Project Owner and Assignee dashboards replace it in the next milestones.
 */
function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  /** Ends the session and returns to the login page. */
  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="container py-5 text-center">
      <h1 className="h3">Welcome, {user.name}</h1>
      <p className="text-secondary">
        You are logged in as <strong>{getRoleLabel(user.role)}</strong>. Your dashboard arrives in the next milestone.
      </p>
      <button type="button" className="btn btn-outline-secondary" onClick={handleLogout}>Logout</button>
    </main>
  );
}

export default Dashboard;
