import { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ROLES, getHomePath } from './model/User';
import Login from './components/Login';
import Signup from './components/Signup';
import ProjectDashboard from './components/ProjectDashboard';
import CreateProject from './components/CreateProject';
import CreateIssue from './components/CreateIssue';
import IssueDetails from './components/IssueDetails';
import EditIssue from './components/EditIssue';
import AssigneeDashboard from './components/AssigneeDashboard';
import AssigneeIssueDetails from './components/AssigneeIssueDetails';

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
      <Route path="/owner/projects/new" element={onlyFor(ROLES.PROJECT_OWNER, <CreateProject />)} />
      <Route path="/owner/issues/new" element={onlyFor(ROLES.PROJECT_OWNER, <CreateIssue />)} />
      <Route path="/owner/issues/:issueId" element={onlyFor(ROLES.PROJECT_OWNER, <IssueDetails />)} />
      <Route path="/owner/issues/:issueId/edit" element={onlyFor(ROLES.PROJECT_OWNER, <EditIssue />)} />
      <Route path="/assignee/dashboard" element={onlyFor(ROLES.ASSIGNEE, <AssigneeDashboard />)} />
      <Route path="/assignee/issues/:issueId" element={onlyFor(ROLES.ASSIGNEE, <AssigneeIssueDetails />)} />

      {/* Unknown URLs go back to the start */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
