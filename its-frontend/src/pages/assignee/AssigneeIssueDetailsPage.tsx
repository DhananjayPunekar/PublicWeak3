import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertMessage } from '../../components/common/AlertMessage';
import { Spinner } from '../../components/common/Spinner';
import { IssueDetailsView } from '../../components/issue/IssueDetailsView';
import { useCurrentUser } from '../../hooks/useAuth';
import { useIssueWithProject } from '../../hooks/useIssueWithProject';
import { issueService } from '../../services/issueService';
import { getErrorMessage } from '../../services/httpClient';
import { PATHS } from '../../routes/paths';
import { STATUSES, statusLabel, type Issue, type IssueStatus } from '../../models/issue';

/**
 * Assignee Issue Details: all issue fields plus a status drop-down. "Save
 * Updates" becomes enabled once the status is changed and saves only the
 * status (assignees cannot change anything else).
 */
export function AssigneeIssueDetailsPage() {
  const { issueId } = useParams<'issueId'>();
  const user = useCurrentUser();
  const { data, loading, error, reload } = useIssueWithProject(Number(issueId));

  /** The issue as last saved (updated locally after a successful save). */
  const [issue, setIssue] = useState<Issue | null>(null);
  /** Status picked in the drop-down. */
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | ''>('');
  /** True while the status is being saved. */
  const [saving, setSaving] = useState(false);
  /** Result of the last save. */
  const [message, setMessage] = useState<{ variant: 'success' | 'danger'; text: string } | null>(null);

  // Copy the loaded issue into local state so it can be updated after saving.
  useEffect(() => {
    if (data) {
      setIssue(data.issue);
      setSelectedStatus(data.issue.status);
    }
  }, [data]);

  if (loading && !data) {
    return <Spinner label="Loading issue..." />;
  }
  if (error || !data || !issue) {
    return (
      <AlertMessage variant="danger">
        {error ?? 'Issue not found.'}{' '}
        <button type="button" className="btn btn-link alert-link p-0 align-baseline" onClick={reload}>Try again</button>
        {' · '}
        <Link to={PATHS.assigneeDashboard} className="alert-link">Back to my issues</Link>
      </AlertMessage>
    );
  }

  /** Assignees may only work on issues assigned to them. */
  const isMine = issue.assignee === user.userId;
  /** Save is possible only after the status was changed. */
  const statusChanged = selectedStatus !== '' && selectedStatus !== issue.status;

  /** Saves the new status with PATCH /api/issues/{id}/status. */
  async function handleSave() {
    if (!issue || selectedStatus === '' || selectedStatus === issue.status) {
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const updated = await issueService.updateStatus(issue.id, selectedStatus);
      setIssue(updated);
      setMessage({ variant: 'success', text: `Status changed to ${statusLabel(updated.status)}.` });
    } catch (saveError) {
      setMessage({ variant: 'danger', text: getErrorMessage(saveError) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {message && (
        <AlertMessage variant={message.variant} onClose={() => setMessage(null)}>
          {message.text}
        </AlertMessage>
      )}
      {!isMine && <AlertMessage variant="warning">This issue is not assigned to you, so its status cannot be changed.</AlertMessage>}
      <IssueDetailsView
        issue={issue}
        project={data.project}
        assignee={isMine ? user : undefined}
        breadcrumb={(
          <>
            <li className="breadcrumb-item"><Link to={PATHS.assigneeDashboard}>Issue Dashboard</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Issue Details</li>
          </>
        )}
        actions={isMine && (
          <>
            <label htmlFor="statusSelect" className="form-label small fw-semibold text-secondary-emphasis">Update status</label>
            <select id="statusSelect" className="form-select" value={selectedStatus} disabled={saving}
              onChange={(event) => { setSelectedStatus(event.target.value as IssueStatus); setMessage(null); }}>
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </>
        )}
        footer={isMine && (
          <button type="button" className="btn btn-accent w-100 mt-3" disabled={!statusChanged || saving} onClick={handleSave}>
            {saving && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
            {saving ? 'Saving...' : 'Save Updates'}
          </button>
        )}
      />
    </>
  );
}
