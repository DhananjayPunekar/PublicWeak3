import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ProjectDashboardPage } from './pages/owner/ProjectDashboardPage';
import { CreateProjectPage } from './pages/owner/CreateProjectPage';
import { CreateIssuePage } from './pages/owner/CreateIssuePage';
import { IssueDetailsPage } from './pages/owner/IssueDetailsPage';
import { EditIssuePage } from './pages/owner/EditIssuePage';
import { ComingSoonPage } from './pages/ComingSoonPage';
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
        <Route element={<AppLayout />}>
          <Route path={PATHS.ownerDashboard} element={<ProjectDashboardPage />} />
          <Route path={PATHS.createProject} element={<CreateProjectPage />} />
          <Route path={PATHS.createIssue} element={<CreateIssuePage />} />
          <Route path={PATHS.ownerIssue(':issueId')} element={<IssueDetailsPage />} />
          <Route path={PATHS.editIssue(':issueId')} element={<EditIssuePage />} />
        </Route>
      </Route>

      {/* Assignee area */}
      <Route element={<ProtectedRoute role="assignee" />}>
        <Route element={<AppLayout />}>
          <Route path={PATHS.assigneeDashboard} element={<ComingSoonPage title="Assignee Dashboard" />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
