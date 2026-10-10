import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { WelcomePage } from './pages/WelcomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAuth } from './hooks/useAuth';
import { homePathFor, PATHS } from './routes/paths';

/** "/" sends logged-in users to their dashboard and everyone else to login. */
function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? homePathFor(user.role) : PATHS.login} replace />;
}

/** All routes of the application. */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path={PATHS.login} element={<LoginPage />} />
      <Route path={PATHS.signup} element={<SignupPage />} />

      {/* Project Owner area */}
      <Route element={<ProtectedRoute role="productOwner" />}>
        <Route path={PATHS.ownerDashboard} element={<WelcomePage />} />
      </Route>

      {/* Assignee area */}
      <Route element={<ProtectedRoute role="assignee" />}>
        <Route path={PATHS.assigneeDashboard} element={<WelcomePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
