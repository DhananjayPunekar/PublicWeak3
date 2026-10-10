import { Link, useParams } from 'react-router-dom';
import { BsPencilSquare } from 'react-icons/bs';
import { AlertMessage } from '../../components/common/AlertMessage';
import { Spinner } from '../../components/common/Spinner';
import { IssueDetailsView } from '../../components/issue/IssueDetailsView';
import { useCurrentUser } from '../../hooks/useAuth';
import { useIssueWithProject } from '../../hooks/useIssueWithProject';
import { useUsers } from '../../hooks/useUsers';
import { PATHS } from '../../routes/paths';

/**
 * Issue Detail screen for the Project Owner: every field of the issue and an
 * "Edit Issue" button (only for issues of the owner's own projects).
 */
export function IssueDetailsPage() {
  const { issueId } = useParams<'issueId'>();
  const user = useCurrentUser();
  const { data, loading, error, reload } = useIssueWithProject(Number(issueId));
  const { usersById } = useUsers();

  if (loading && !data) {
    return <Spinner label="Loading issue..." />;
  }
  if (error || !data) {
    return (
      <AlertMessage variant="danger">
        {error ?? 'Issue not found.'}{' '}
        <button type="button" className="btn btn-link alert-link p-0 align-baseline" onClick={reload}>Try again</button>
        {' · '}
        <Link to={PATHS.ownerDashboard} className="alert-link">Back to the dashboard</Link>
      </AlertMessage>
    );
  }

  const { issue, project } = data;
  /** Only the owner of the issue's project may edit it. */
  const canEdit = project?.productOwner === user.userId;

  return (
    <>
      {!canEdit && (
        <AlertMessage variant="warning">This issue belongs to a project you do not own, so it is read-only.</AlertMessage>
      )}
      <IssueDetailsView
        issue={issue}
        project={project}
        assignee={usersById.get(issue.assignee)}
        breadcrumb={(
          <>
            <li className="breadcrumb-item"><Link to={`${PATHS.ownerDashboard}?projectId=${issue.project}`}>Project Board</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Issue Details</li>
          </>
        )}
        actions={canEdit && (
          <Link to={PATHS.editIssue(issue.id)} className="btn btn-dark btn-sm w-100">
            <BsPencilSquare className="me-2" aria-hidden="true" />
            Edit Issue
          </Link>
        )}
      />
    </>
  );
}
