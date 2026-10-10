import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BsFolderX, BsPlusLg } from 'react-icons/bs';
import { IssueBoard } from '../../components/board/IssueBoard';
import { AlertMessage } from '../../components/common/AlertMessage';
import { Spinner } from '../../components/common/Spinner';
import { useLayoutContext } from '../../components/layout/layoutContext';
import { useCurrentUser } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useUsers } from '../../hooks/useUsers';
import { projectService } from '../../services/projectService';
import { PATHS } from '../../routes/paths';
import { PRIORITIES, type Issue, type Priority } from '../../models/issue';
import { formatDate } from '../../utils/date';
import { filterIssuesBySearch } from '../../utils/search';

/** Query-string parameter holding the selected project (so links can open a given project). */
const PROJECT_PARAM = 'projectId';

/**
 * Project Owner Dashboard: pick one of the owner's projects and see its
 * issues on a board, filtered by assignee, priority and the header search.
 * All filtering happens in the browser.
 */
export function ProjectDashboardPage() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const { searchText } = useLayoutContext();
  const [searchParams, setSearchParams] = useSearchParams();

  /** Projects owned by the logged-in user. */
  const projectsLoader = useCallback(() => projectService.getProjectsByOwner(user.userId), [user.userId]);
  const { data: projects, loading: projectsLoading, error: projectsError, reload: reloadProjects } = useApi(projectsLoader);
  /** Every user, for assignee names and photos. */
  const { usersById, error: usersError } = useUsers();

  /** Selected project: the one in the URL if it is ours, otherwise the first from the API. */
  const requestedId = Number(searchParams.get(PROJECT_PARAM));
  const selectedProject = projects?.find((project) => project.id === requestedId) ?? projects?.[0] ?? null;
  const selectedId = selectedProject?.id ?? null;

  /** Issues of the selected project. */
  const issuesLoader = useCallback(
    () => (selectedId === null ? Promise.resolve<Issue[]>([]) : projectService.getProjectIssues(selectedId)),
    [selectedId],
  );
  const { data: issues, loading: issuesLoading, error: issuesError, reload: reloadIssues } = useApi(issuesLoader);

  /** Assignee filter: '' = everyone, otherwise a user ID. */
  const [assigneeFilter, setAssigneeFilter] = useState('');
  /** Priority filter: '' = all priorities. */
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');

  // Filters belong to one project - clear them when another project is selected.
  useEffect(() => {
    setAssigneeFilter('');
    setPriorityFilter('');
  }, [selectedId]);

  /** Team members = people assigned to at least one issue of this project. */
  const teamMembers = useMemo(() => {
    const ids = [...new Set((issues ?? []).map((issue) => issue.assignee))];
    return ids
      .map((id) => ({ id, name: usersById.get(id)?.name ?? `User #${id}` }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [issues, usersById]);

  /** Issues after applying the search text, assignee and priority filters. */
  const visibleIssues = useMemo(() => {
    let result = filterIssuesBySearch(issues ?? [], searchText);
    if (assigneeFilter !== '') {
      result = result.filter((issue) => issue.assignee === Number(assigneeFilter));
    }
    if (priorityFilter !== '') {
      result = result.filter((issue) => issue.priority === priorityFilter);
    }
    return result;
  }, [issues, searchText, assigneeFilter, priorityFilter]);

  /** Opens the details page of an issue. */
  const openIssue = useCallback((issue: Issue) => navigate(PATHS.ownerIssue(issue.id)), [navigate]);

  if (projectsLoading && !projects) {
    return <Spinner label="Loading your projects..." />;
  }
  if (projectsError) {
    return (
      <AlertMessage variant="danger">
        {projectsError}{' '}
        <button type="button" className="btn btn-link alert-link p-0 align-baseline" onClick={reloadProjects}>
          Try again
        </button>
      </AlertMessage>
    );
  }
  if (!projects || projects.length === 0 || !selectedProject) {
    return (
      <div className="empty-state text-center py-5">
        <BsFolderX className="display-4 text-secondary mb-3" aria-hidden="true" />
        <h1 className="h4 text-danger fw-semibold">No Projects Available!</h1>
        <p className="text-secondary">Create your first project to start tracking issues.</p>
        <Link to={PATHS.createProject} className="btn btn-outline-primary">
          <BsPlusLg className="me-1" aria-hidden="true" />
          Create Project
        </Link>
      </div>
    );
  }

  const ownerName = usersById.get(selectedProject.productOwner)?.name ?? user.name;

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="h5 fw-bold text-uppercase mb-0 page-title">Project Dashboard</h1>
        <Link to={`${PATHS.createIssue}?${PROJECT_PARAM}=${selectedProject.id}`} className="btn btn-primary btn-sm">
          <BsPlusLg className="me-1" aria-hidden="true" />
          New Issue
        </Link>
      </div>

      <section className="card border-0 shadow-sm mb-4" aria-label="Project details and filters">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-lg-6">
              <label htmlFor="projectSelect" className="form-label small fw-semibold text-secondary-emphasis">Project Name</label>
              <select
                id="projectSelect"
                className="form-select"
                value={selectedProject.id}
                onChange={(event) => setSearchParams({ [PROJECT_PARAM]: event.target.value }, { replace: true })}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.projectName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-lg-6">
              <span className="small fw-semibold text-secondary-emphasis me-2">Project Owner Name:</span>
              <span className="fw-bold text-uppercase" data-testid="owner-name">{ownerName}</span>
              <div className="small text-secondary mt-1" data-testid="project-dates">
                Start Date: {formatDate(selectedProject.startDate)} | End Date: {formatDate(selectedProject.endDate)}
              </div>
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="assigneeFilter" className="form-label small fw-semibold text-secondary-emphasis">Filter by Assignee</label>
              <select id="assigneeFilter" className="form-select" value={assigneeFilter}
                onChange={(event) => setAssigneeFilter(event.target.value)}>
                <option value="">All team members</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="priorityFilter" className="form-label small fw-semibold text-secondary-emphasis">Filter by Priority</label>
              <select id="priorityFilter" className="form-select" value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value as Priority | '')}>
                <option value="">All</option>
                {PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {usersError && <AlertMessage variant="warning">Could not load user names: {usersError}</AlertMessage>}
      {issuesError ? (
        <AlertMessage variant="danger">
          {issuesError}{' '}
          <button type="button" className="btn btn-link alert-link p-0 align-baseline" onClick={reloadIssues}>
            Try again
          </button>
        </AlertMessage>
      ) : issuesLoading && !issues ? (
        <Spinner label="Loading issues..." />
      ) : (
        <>
          {(issues?.length ?? 0) > 0 && visibleIssues.length === 0 && (
            <p className="text-secondary small">No issues match the current search and filters.</p>
          )}
          <IssueBoard issues={visibleIssues} usersById={usersById} onOpen={openIssue} />
        </>
      )}
    </>
  );
}
