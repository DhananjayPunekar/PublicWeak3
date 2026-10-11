import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { AuthContext } from '../context/AuthContext';
import {
  STATUS_COLUMNS,
  getPriorityBadgeClass,
  getPriorityLabel,
  getStatusLabel,
  getTypeLabel,
  parseTags,
} from '../model/Issue';
import { formatDate } from '../model/Project';
import { getIssueById, updateIssueStatus } from '../service/issueService';
import { getProjectById } from '../service/projectService';

/**
 * Assignee Issue Details (Milestone 6).
 * Shows the issue fields and a status drop-down. "Save Updates" becomes
 * enabled once the status is changed, and saves only the status.
 */
function AssigneeIssueDetails() {
  const { user } = useContext(AuthContext);
  // Issue ID from the URL: /assignee/issues/:issueId
  const { issueId } = useParams();

  // The issue as last saved, and its project (null while loading / unknown)
  const [issue, setIssue] = useState(null);
  const [project, setProject] = useState(null);
  // Status chosen in the drop-down
  const [selectedStatus, setSelectedStatus] = useState('');
  // True while the status is being saved
  const [saving, setSaving] = useState(false);
  // Result messages
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Load the issue, then its project
  useEffect(() => {
    getIssueById(issueId)
      .then((loadedIssue) => {
        setIssue(loadedIssue);
        setSelectedStatus(loadedIssue.status);
        getProjectById(loadedIssue.project).then(setProject).catch(() => setProject(null));
      })
      .catch((loadError) => setError(loadError.message));
  }, [issueId]);

  // Assignees may only update issues assigned to them
  const isMine = issue !== null && issue.assignee === user.userId;
  // Save Updates is enabled only after the status was changed
  const statusChanged = issue !== null && selectedStatus !== issue.status;

  /** Status drop-down changed. */
  function handleStatusChange(event) {
    setSelectedStatus(event.target.value);
    setSuccessMessage('');
    setError('');
  }

  /** Saves the new status with PATCH /api/issues/{id}/status. */
  async function handleSave() {
    if (!statusChanged || saving) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateIssueStatus(issue.id, selectedStatus);
      setIssue(updated);
      setSuccessMessage(`Status changed to ${getStatusLabel(updated.status)}.`);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

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
    if (!issue) {
      return error ? (
        <div className="alert alert-danger">
          {error} <Link to="/assignee/dashboard" className="alert-link">Back to my issues</Link>
        </div>
      ) : (
        <div className="text-center text-secondary py-5">
          <span className="spinner-border spinner-border-sm me-2"></span>Loading issue...
        </div>
      );
    }

    const tags = parseTags(issue.tags);
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          {/* Breadcrumb back to the dashboard */}
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb small mb-2">
              <li className="breadcrumb-item"><Link to="/assignee/dashboard">Issue Dashboard</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Issue Details</li>
            </ol>
          </nav>

          {/* Title */}
          <div className="bg-light border-start border-4 border-warning rounded-3 px-3 py-2 mb-4">
            <div className="small text-secondary">#{issue.id}{project ? ` · ${project.projectName}` : ''}</div>
            <h1 id="issue-title" className="h4 fw-bold text-primary mb-0">{issue.summary}</h1>
          </div>

          {successMessage && <div className="alert alert-success py-2" role="alert">{successMessage}</div>}
          {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
          {!isMine && (
            <div className="alert alert-warning py-2">This issue is not assigned to you, so its status cannot be changed.</div>
          )}

          <div className="row g-4">
            {/* Description and details */}
            <div className="col-lg-8">
              <h2 className="h6 fw-bold">Description</h2>
              <p className="mb-4" style={{ whiteSpace: 'pre-line' }}>{issue.description}</p>

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

            {/* Side panel: status drop-down, current status and dates */}
            <div className="col-lg-4">
              <div className="bg-light border rounded-3 p-3">
                {isMine && (
                  <div className="mb-3">
                    <label htmlFor="statusSelect" className="form-label fw-semibold small">Update Status</label>
                    <select id="statusSelect" className="form-select" value={selectedStatus}
                      onChange={handleStatusChange} disabled={saving}>
                      {STATUS_COLUMNS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                {detail('Status', <span className="fw-semibold text-primary">{getStatusLabel(issue.status)}</span>, 'issue-status')}
                {detail('Created On', formatDate(issue.createdOn))}
                {detail('Last Updated', formatDate(issue.lastUpdated), 'issue-last-updated')}
              </div>
            </div>
          </div>

          {/* Save Updates: enabled only after the status was changed */}
          {isMine && (
            <div className="text-center mt-4">
              <button type="button" className="btn btn-warning fw-semibold px-4" disabled={!statusChanged || saving} onClick={handleSave}>
                {saving && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
                {saving ? 'Saving...' : 'Save Updates'}
              </button>
            </div>
          )}
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

export default AssigneeIssueDetails;
