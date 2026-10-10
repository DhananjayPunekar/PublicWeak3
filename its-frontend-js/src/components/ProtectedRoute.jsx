import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getHomePath } from '../model/User';

/**
 * Shows the page only to a logged-in user with the given role.
 * Visitors go to the login page; users with the other role go to their own dashboard.
 */
function ProtectedRoute({ role, children }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== role) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }
  return children;
}

export default ProtectedRoute;
