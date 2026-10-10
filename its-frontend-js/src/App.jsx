import { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ROLES, getHomePath } from './model/User';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ProjectDashboard from './components/ProjectDashboard';

/**
 * All pages of the application.
 * Dashboards are only reachable after login, and only for the matching role.
 */
function App() {
  const { user } = useContext(AuthContext);

  /**
   * Shows `page` only to a logged-in user with the given role:
   * visitors go to the login page, users with the other role go to their own dashboard.
   */
  function onlyFor(role, page) {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (user.role !== role) {
      return <Navigate to={getHomePath(user.role)} replace />;
    }
    return page;
  }

  return (
    <Routes>
      {/* "/" opens the user's dashboard, or the login page when nobody is logged in */}
      <Route path="/" element={<Navigate to={user ? getHomePath(user.role) : '/login'} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/owner/dashboard" element={onlyFor(ROLES.PROJECT_OWNER, <ProjectDashboard />)} />
      <Route path="/assignee/dashboard" element={onlyFor(ROLES.ASSIGNEE, <Dashboard />)} />

      {/* Unknown URLs go back to the start */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
