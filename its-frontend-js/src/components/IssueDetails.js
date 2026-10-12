import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { AuthContext } from '../context/AuthContext';
import { getPriorityBadgeClass, getPriorityLabel, getStatusLabel, getTypeLabel, parseTags } from '../model/Issue';
import { formatDate } from '../model/Project';
import { getInitials } from '../model/User';
import { getIssueById } from '../service/issueService';
import { getProjectById, getProjectsByOwner } from '../service/projectService';
import { getUserById } from '../service/userService';

/**
 * Issue Detail screen for the Project Owner (Milestone 5).
 * Shows every field of the issue; "Edit Issue" opens the edit form.
 */
function IssueDetails() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  // Issue ID from the URL: /owner/issues/:issueId
  const { issueId } = useParams();
  // Success message after editing (set by EditIssue)
  const successMessage = useLocation().state?.message;

  // The issue, its project and its assignee (null while loading / when unknown)
  const [issue, setIssue] = useState(null);
  const [project, setProject] = useState(null);
  const [assignee, setAssignee] = useState(null);
  // IDs of the projects the logged-in owner owns (null while loading)
  const [ownedProjectIds, setOwnedProjectIds] = useState(null);
  // Error message when the issue cannot be loaded
  const [error, setError] = useState('');

  // Load the issue, then its project and assignee
  useEffect(() => {
    getIssueById(issueId)
      .then((loadedIssue) => {
        setIssue(loadedIssue);
        getProjectById(loadedIssue.project).then(setProject).catch(() => setProject(null));
        getUserById(loadedIssue.assignee).then(setAssignee).catch(() => setAssignee(null));
      })
      .catch((loadError) => setError(loadError.message));

    // Same list as the dashboard: the projects owned by the logged-in user
    getProjectsByOwner(user.userId)
      .then((projects) => setOwnedProjectIds(projects.map((ownedProject) => String(ownedProject.id))))
      .catch(() => setOwnedProjectIds([]));
  }, [issueId, user]);

  // Only the owner of the issue's project may edit it:
  // the issue's project must be one of the logged-in owner's projects
  const canEdit = issue !== null && ownedProjectIds !== null && ownedProjectIds.includes(String(issue.project));
  const assigneeName = assignee ? assignee.name : issue ? `User #${issue.assignee}` : '';

  /** One "Label: value" line of the details. */
  function detail(label, value, testId) {
    return (
      <div className="d-flex gap-2 mb-2 small">
        <span className="fw-semibold text-secondary" style={{ minWidth: '100px' }}>{label}:</span>
        <span data-testid={testId}>{value}</span>
      </div>
    );
  }

  /** Main area: loading, error or the details. */
  function renderContent() {
    if (error) {
      return (
        <div className="alert alert-danger">
          {error} <Link to="/owner/dashboard" className="alert-link">Back to the dashboard</Link>
        </div>
      );
    }
    if (!issue) {
      return (
        <div className="text-center text-secondary py-5">
          <span className="spinner-border spinner-border-sm me-2"></span>Loading issue...
        </div>
      );
    }

    const tags = parseTags(issue.tags);
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          {/* Breadcrumb: back to the board of this issue's project */}
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb small mb-2">
              <li className="breadcrumb-item">
                <Link to="/owner/dashboard" state={{ projectId: issue.project }}>Project Board</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Issue Details</li>
            </ol>
          </nav>

          {/* Title */}
          <div className="bg-light border-start border-4 border-warning rounded-3 px-3 py-2 mb-4">
            <div className="small text-secondary">#{issue.id}{project ? ` · ${project.projectName}` : ''}</div>
            <h1 id="issue-title" className="h4 fw-bold text-primary mb-0">{issue.summary}</h1>
          </div>

          {successMessage && <div className="alert alert-success py-2" role="alert">{successMessage}</div>}
          {issue && ownedProjectIds !== null && !canEdit && (
            <div className="alert alert-warning py-2">This issue belongs to a project you do not own, so it is read-only.</div>
          )}

          <div className="row g-4">
            {/* Description and details */}
            <div className="col-lg-8">
              <h2 className="h6 fw-bold">Description</h2>
              <p className="mb-4" style={{ whiteSpace: 'pre-line' }} data-testid="issue-description">{issue.description}</p>

              <h2 className="h6 fw-bold">Details</h2>
              <div className="row">
                <div className="col-sm-6">
                  {detail('Type', getTypeLabel(issue.type))}
                  {detail('Tags', tags.length === 0 ? '-' : (
                    <span className="d-inline-flex flex-wrap gap-1">
                      {tags.map((tag) => <span key={tag} className="badge text-bg-success">{tag}</span>)}
                    </span>
                  ))}
                  {detail('Story Points', issue.storyPoint ?? '-')}
                </div>
                <div className="col-sm-6">
                  {detail('Sprint', issue.sprint || '-')}
                  {detail('Priority', <span className={getPriorityBadgeClass(issue.priority)}>{getPriorityLabel(issue.priority)}</span>)}
                </div>
              </div>
            </div>

            {/* Side panel: Edit Issue, status, assignee, dates */}
            <div className="col-lg-4">
              <div className="bg-light border rounded-3 p-3">
                {canEdit && (
                  <button type="button" className="btn btn-dark btn-sm w-100 mb-3"
                    onClick={() => navigate(`/owner/issues/${issue.id}/edit`)}>
                    Edit Issue
                  </button>
                )}
                {detail('Status', <span className="fw-semibold text-primary">{getStatusLabel(issue.status)}</span>, 'issue-status')}
                {detail('Assignee', (
                  <span className="d-inline-flex align-items-center gap-2">
                    {assignee?.profileImage ? (
                      <img src={assignee.profileImage} alt={assigneeName} width="24" height="24" className="rounded-circle object-fit-cover" />
                    ) : (
                      <span className="rounded-circle bg-secondary text-white d-inline-flex align-items-center justify-content-center fw-semibold"
                        style={{ width: '24px', height: '24px', fontSize: '0.65rem' }}>
                        {getInitials(assigneeName)}
                      </span>
                    )}
                    {assigneeName}
                  </span>
                ))}
                {detail('Created On', formatDate(issue.createdOn))}
                {detail('Last Updated', formatDate(issue.lastUpdated), 'issue-last-updated')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        <Sidebar />
        <div className="col-md-9 col-xl-10 p-0 bg-light">
          <Header />
          <main className="p-3 p-md-4">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}

export default IssueDetails;
