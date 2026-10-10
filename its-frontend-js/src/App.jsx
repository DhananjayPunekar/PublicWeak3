import { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ROLES, getHomePath } from './model/User';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';

/**
 * All pages of the application.
 * Dashboards are only reachable after login, and only for the matching role.
 */
function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* "/" opens the user's dashboard, or the login page when nobody is logged in */}
      <Route path="/" element={<Navigate to={user ? getHomePath(user.role) : '/login'} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/owner/dashboard"
        element={<ProtectedRoute role={ROLES.PROJECT_OWNER}><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/assignee/dashboard"
        element={<ProtectedRoute role={ROLES.ASSIGNEE}><Dashboard /></ProtectedRoute>}
      />

      {/* Unknown URLs go back to the start */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
