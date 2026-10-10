import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertMessage } from '../../components/common/AlertMessage';
import { Spinner } from '../../components/common/Spinner';
import { IssueFormFields } from '../../components/issue/IssueFormFields';
import { BLANK_ISSUE_FORM, toIssueRequest, validateCreateIssue, type IssueFormValues } from '../../components/issue/issueForm';
import { useLayoutContext } from '../../components/layout/layoutContext';
import { useCurrentUser } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useForm } from '../../hooks/useForm';
import { useUsers } from '../../hooks/useUsers';
import { issueService } from '../../services/issueService';
import { projectService } from '../../services/projectService';
import { getErrorMessage } from '../../services/httpClient';
import { PATHS } from '../../routes/paths';
import type { NavigationState } from '../../routes/navigationState';

/**
 * Create Issue screen (Project Owner). Controlled form with every validation
 * from the requirements; on success the user returns to the project board.
 */
export function CreateIssuePage() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshStats } = useLayoutContext();

  /** Projects owned by the user, for the Project drop-down. */
  const projectsLoader = useCallback(() => projectService.getProjectsByOwner(user.userId), [user.userId]);
  const { data: projects, loading: projectsLoading, error: projectsError } = useApi(projectsLoader);
  /** Users for the Assignee drop-down. */
  const { users, error: usersError } = useUsers();

  /** Start values: project from ?projectId= (when coming from a board) and status "TO DO". */
  const initialValues = useMemo<IssueFormValues>(
    () => ({ ...BLANK_ISSUE_FORM, project: searchParams.get('projectId') ?? '', status: 'TO DO' }),
    [searchParams],
  );
  const { values, errors, isValid, handleChange, handleBlur, showError, touchAll, reset, setField } = useForm(initialValues, validateCreateIssue);

  // A project ID from the URL that is not one of the user's projects must not stay selected.
  useEffect(() => {
    if (projects && values.project !== '' && !projects.some((project) => String(project.id) === values.project)) {
      setField('project', '');
    }
  }, [projects, values.project, setField]);

  /** True while the create request is running. */
  const [submitting, setSubmitting] = useState(false);
  /** Error message from the server. */
  const [serverError, setServerError] = useState<string | null>(null);

  /** Sends the issue to the back end and returns to the project board. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    touchAll();
    if (!isValid || submitting) {
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      const response = await issueService.createIssue(toIssueRequest(values, user.userId));
      refreshStats();
      const state: NavigationState = { flash: `Issue #${response.issueId} "${response.issue.summary}" created successfully.` };
      navigate(`${PATHS.ownerDashboard}?projectId=${response.issue.project}`, { state });
    } catch (error) {
      setServerError(getErrorMessage(error));
      setSubmitting(false);
    }
  }

  /** "Reset": all fields blank. */
  function handleReset() {
    reset(BLANK_ISSUE_FORM);
    setServerError(null);
  }

  if (projectsLoading && !projects) {
    return <Spinner label="Loading your projects..." />;
  }

  return (
    <section className="card border-0 shadow-sm form-card" aria-labelledby="create-issue-title">
      <div className="card-body p-4">
        <h1 id="create-issue-title" className="h5 fw-bold mb-4">Create Issue</h1>

        {serverError && (
          <AlertMessage variant="danger" onClose={() => setServerError(null)}>
            {serverError}
          </AlertMessage>
        )}
        {projectsError && <AlertMessage variant="danger">Could not load your projects: {projectsError}</AlertMessage>}
        {usersError && <AlertMessage variant="warning">Could not load users: {usersError}</AlertMessage>}
        {projects && projects.length === 0 && (
          <AlertMessage variant="warning">
            You have no projects yet. <Link to={PATHS.createProject} className="alert-link">Create a project</Link> first.
          </AlertMessage>
        )}

        <form noValidate onSubmit={handleSubmit} aria-label="Create issue form">
          <IssueFormFields mode="create" values={values} errors={errors} showError={showError}
            onChange={handleChange} onBlur={handleBlur} projects={projects ?? []} users={users} />

          <div className="d-flex justify-content-center gap-2 mt-2">
            <button type="submit" className="btn btn-primary px-4" disabled={!isValid || submitting}>
              {submitting && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
              {submitting ? 'Creating...' : 'Create'}
            </button>
            <button type="button" className="btn btn-outline-primary px-4" onClick={handleReset} disabled={submitting}>
              Reset
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
