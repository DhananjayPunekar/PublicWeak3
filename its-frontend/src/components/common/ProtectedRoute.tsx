import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { homePathFor, PATHS } from '../../routes/paths';
import type { Role } from '../../models/user';

/** Props of {@link ProtectedRoute}. */
interface ProtectedRouteProps {
  /** Role allowed to open the nested routes. */
  role: Role;
}

/**
 * Guards a group of routes: visitors who are not logged in go to the login
 * page, and users with the other role go to their own dashboard.
 */
export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={PATHS.login} replace state={{ from: location.pathname }} />;
  }
  if (user.role !== role) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }
  return <Outlet />;
}
