import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertMessage } from '../../components/common/AlertMessage';
import { Spinner } from '../../components/common/Spinner';
import { IssueFormFields } from '../../components/issue/IssueFormFields';
import { toFormValues, toUpdateRequest, validateEditIssue } from '../../components/issue/issueForm';
import { useLayoutContext } from '../../components/layout/layoutContext';
import { useCurrentUser } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useForm } from '../../hooks/useForm';
import { useIssueWithProject } from '../../hooks/useIssueWithProject';
import { useUsers } from '../../hooks/useUsers';
import { issueService } from '../../services/issueService';
import { publishIssueSaved } from '../../services/issueEvents';
import { projectService } from '../../services/projectService';
import { getErrorMessage } from '../../services/httpClient';
import { PATHS } from '../../routes/paths';
import type { NavigationState } from '../../routes/navigationState';
import type { Issue } from '../../models/issue';
import type { Project } from '../../models/project';
import type { User } from '../../models/user';

/** Props of {@link EditIssueForm}. */
interface EditIssueFormProps {
  issue: Issue;
  projects: readonly Project[];
  users: readonly User[];
}

/**
 * The edit form itself. Mounted only once the issue is loaded, so the form
 * starts with the issue's values (which "Reset" goes back to).
 */
function EditIssueForm({ issue, projects, users }: EditIssueFormProps) {
  const navigate = useNavigate();
  const { refreshStats } = useLayoutContext();
  const initialValues = useMemo(() => toFormValues(issue), [issue]);
  const { values, errors, isValid, handleChange, handleBlur, showError, touchAll, reset } = useForm(initialValues, validateEditIssue);

  /** True while the update request is running. */
  const [submitting, setSubmitting] = useState(false);
  /** Error message from the server. */
  const [serverError, setServerError] = useState<string | null>(null);

  /** Saves the changes and returns to the details screen. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    touchAll();
    if (!isValid || submitting) {
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      const updated = await issueService.updateIssue(issue.id, toUpdateRequest(values));
      publishIssueSaved(issue, updated);
      refreshStats();
      const state: NavigationState = { flash: `Issue #${updated.id} updated successfully.` };
      navigate(PATHS.ownerIssue(updated.id), { state });
    } catch (error) {
      setServerError(getErrorMessage(error));
      setSubmitting(false);
    }
  }

  /** "Reset": back to the values the issue had when the screen opened. */
  function handleReset() {
    reset();
    setServerError(null);
  }

  return (
    <form noValidate onSubmit={handleSubmit} aria-label="Edit issue form">
      {serverError && (
        <AlertMessage variant="danger" onClose={() => setServerError(null)}>
          {serverError}
        </AlertMessage>
      )}
      <IssueFormFields mode="edit" values={values} errors={errors} showError={showError}
        onChange={handleChange} onBlur={handleBlur} projects={projects} users={users} />
      <div className="d-flex justify-content-center gap-2 mt-2">
        <button type="submit" className="btn btn-primary px-4" disabled={!isValid || submitting}>
          {submitting && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
          {submitting ? 'Saving...' : 'Edit'}
        </button>
        <button type="button" className="btn btn-outline-primary px-4" onClick={handleReset} disabled={submitting}>
          Reset
        </button>
        <Link to={PATHS.ownerIssue(issue.id)} className="btn btn-link">Cancel</Link>
      </div>
    </form>
  );
}

/**
 * Edit Issue screen (Project Owner). Loads the issue, the owner's projects
 * and the users, then shows the pre-filled form.
 */
export function EditIssuePage() {
  const { issueId } = useParams<'issueId'>();
  const user = useCurrentUser();
  const { data, loading, error } = useIssueWithProject(Number(issueId));
  const projectsLoader = useCallback(() => projectService.getProjectsByOwner(user.userId), [user.userId]);
  const { data: projects, error: projectsError } = useApi(projectsLoader);
  const { users, loading: usersLoading, error: usersError } = useUsers();

  if ((loading && !data) || (!projects && !projectsError) || usersLoading) {
    return <Spinner label="Loading issue..." />;
  }
  const loadError = error ?? projectsError ?? usersError;
  if (loadError || !data || !projects) {
    return <AlertMessage variant="danger">{loadError ?? 'Issue not found.'} <Link to={PATHS.ownerDashboard} className="alert-link">Back to the dashboard</Link></AlertMessage>;
  }
  if (data.project?.productOwner !== user.userId) {
    return (
      <AlertMessage variant="warning">
        Only the owner of the project can edit this issue. <Link to={PATHS.ownerIssue(data.issue.id)} className="alert-link">Back to the issue</Link>
      </AlertMessage>
    );
  }

  return (
    <section className="card border-0 shadow-sm form-card" aria-labelledby="edit-issue-title">
      <div className="card-body p-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb small mb-2">
            <li className="breadcrumb-item"><Link to={`${PATHS.ownerDashboard}?projectId=${data.issue.project}`}>Project Board</Link></li>
            <li className="breadcrumb-item"><Link to={PATHS.ownerIssue(data.issue.id)}>Issue Details</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Edit</li>
          </ol>
        </nav>
        <h1 id="edit-issue-title" className="h5 fw-bold mb-4">Edit Issue #{data.issue.id}</h1>
        <EditIssueForm issue={data.issue} projects={projects} users={users} />
      </div>
    </section>
  );
}
