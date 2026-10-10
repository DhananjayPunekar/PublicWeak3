import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ROLES, getInitials } from '../model/User';
import projectService from '../service/projectService';
import issueService from '../service/issueService';

/** Navigation links of the Project Owner. */
const OWNER_LINKS = [
  { to: '/owner/dashboard', label: 'Project Dashboard' },
  { to: '/owner/projects/new', label: 'Create Project' },
  { to: '/owner/issues/new', label: 'Create Issue' },
];

/**
 * Left sidebar shown on every page after login:
 * profile image, name, email, counters, navigation links and Logout.
 */
function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Counters under the profile (null while loading)
  const [projectCount, setProjectCount] = useState(null);
  const [issueCount, setIssueCount] = useState(null);

  // Load the counters once when the sidebar appears
  useEffect(() => {
    if (user.role === ROLES.PROJECT_OWNER) {
      projectService.getProjectsByOwner(user.userId)
        .then((projects) => setProjectCount(projects.length))
        .catch(() => setProjectCount('-'));
      issueService.getIssuesByOwner(user.userId)
        .then((issues) => setIssueCount(issues.length))
        .catch(() => setIssueCount('-'));
    }
  }, [user]);

  /** Ends the session and returns to the login page. */
  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="col-md-3 col-xl-2 bg-dark text-white d-flex flex-column p-3">
      {/* Profile */}
      <div className="text-center pt-2 pb-3">
        {user.profileImage ? (
          <img src={user.profileImage} alt={user.name} width="80" height="80"
            className="rounded-circle border border-3 border-info object-fit-cover mb-2" />
        ) : (
          <div className="rounded-circle border border-3 border-info bg-secondary d-inline-flex align-items-center justify-content-center fs-3 fw-bold mb-2"
            style={{ width: '80px', height: '80px' }}>
            {getInitials(user.name)}
          </div>
        )}
        <div className="fw-semibold">{user.name}</div>
        <div className="small text-info text-break">{user.email}</div>
      </div>

      {/* Counters */}
      {user.role === ROLES.PROJECT_OWNER && (
        <div className="row g-2 text-center mb-3">
          <div className="col-6">
            <div className="border border-secondary rounded-3 py-2">
              <div className="fs-4 fw-bold" data-testid="stat-Projects Created">{projectCount ?? '…'}</div>
              <div className="small text-white-50">Projects Created</div>
            </div>
          </div>
          <div className="col-6">
            <div className="border border-secondary rounded-3 py-2">
              <div className="fs-4 fw-bold" data-testid="stat-Issues Created">{issueCount ?? '…'}</div>
              <div className="small text-white-50">Issues Created</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation (Project Owner) */}
      {user.role === ROLES.PROJECT_OWNER && (
        <nav className="nav nav-pills flex-column gap-1 mb-3">
          {OWNER_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link text-white-50')}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}

      <button type="button" className="btn btn-outline-light btn-sm mt-auto" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
