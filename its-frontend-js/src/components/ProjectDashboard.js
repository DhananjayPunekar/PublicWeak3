import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import IssueBoard from './IssueBoard';
import { AuthContext } from '../context/AuthContext';
import { PRIORITY_OPTIONS, filterIssues } from '../model/Issue';
import { formatDate } from '../model/Project';
import projectService from '../service/projectService';
import userService from '../service/userService';

/**
 * Project Owner Dashboard (Milestone 2).
 * Pick one of your projects and see its issues on a board.
 * Filtering by assignee, priority and the search bar is done in the browser.
 */
function ProjectDashboard() {
  const { user } = useContext(AuthContext);

  // Projects owned by the logged-in user (null while loading)
  const [projects, setProjects] = useState(null);
  // ID of the project chosen in the drop-down
  const [selectedProjectId, setSelectedProjectId] = useState('');
  // Issues of the selected project
  const [issues, setIssues] = useState([]);
  // Every user, to show assignee names and photos
  const [users, setUsers] = useState([]);
  // Filters
  const [searchText, setSearchText] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  // Loading / error state
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [error, setError] = useState('');

  // 1. Load the owner's projects and all users once
  useEffect(() => {
    projectService.getProjectsByOwner(user.userId)
      .then((ownedProjects) => {
        setProjects(ownedProjects);
        // The first project from the API is selected by default
        if (ownedProjects.length > 0) {
          setSelectedProjectId(String(ownedProjects[0].id));
        }
      })
      .catch((loadError) => {
        setProjects([]);
        setError(loadError.message);
      });

    userService.getAllUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [user]);

  // 2. Load the issues whenever another project is selected
  useEffect(() => {
    if (selectedProjectId === '') return;
    setLoadingIssues(true);
    setAssigneeFilter('');
    setPriorityFilter('');
    projectService.getProjectIssues(selectedProjectId)
      .then((projectIssues) => {
        setIssues(projectIssues);
        setError('');
      })
      .catch((loadError) => {
        setIssues([]);
        setError(loadError.message);
      })
      .finally(() => setLoadingIssues(false));
  }, [selectedProjectId]);

  const selectedProject = (projects || []).find((project) => String(project.id) === selectedProjectId);
  const owner = selectedProject && users.find((person) => person.userId === selectedProject.productOwner);

  // Team members = everyone assigned to at least one issue of this project
  const teamMemberIds = [...new Set(issues.map((issue) => issue.assignee))];
  const teamMembers = teamMemberIds.map((id) => {
    const member = users.find((person) => person.userId === id);
    return { id, name: member ? member.name : `User #${id}` };
  });

  const visibleIssues = filterIssues(issues, searchText, assigneeFilter, priorityFilter);

  /** Main area: loading, error, "no projects" or the dashboard itself. */
  function renderContent() {
    if (projects === null) {
      return (
        <div className="text-center text-secondary py-5">
          <span className="spinner-border spinner-border-sm me-2"></span>Loading your projects...
        </div>
      );
    }

    if (projects.length === 0) {
      return (
        <div className="text-center py-5">
          {error && <div className="alert alert-danger">{error}</div>}
          <h1 className="h4 text-danger fw-semibold">No Projects Available!</h1>
          <p className="text-secondary">Create your first project to start tracking issues.</p>
          <Link to="/owner/projects/new" className="btn btn-outline-primary">Create Project</Link>
        </div>
      );
    }

    return (
      <>
        <h1 className="h5 fw-bold text-uppercase mb-3">Project Dashboard</h1>

        {/* Project details and filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-12 col-lg-6">
                <label htmlFor="projectSelect" className="form-label small fw-semibold">Project Name</label>
                <select id="projectSelect" className="form-select" value={selectedProjectId}
                  onChange={(event) => setSelectedProjectId(event.target.value)}>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.projectName}</option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-lg-6">
                <span className="small fw-semibold me-2">Project Owner Name:</span>
                <span className="fw-bold text-uppercase" data-testid="owner-name">{owner ? owner.name : user.name}</span>
                <div className="small text-secondary mt-1" data-testid="project-dates">
                  Start Date: {formatDate(selectedProject?.startDate)} | End Date: {formatDate(selectedProject?.endDate)}
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="assigneeFilter" className="form-label small fw-semibold">Filter by Assignee</label>
                <select id="assigneeFilter" className="form-select" value={assigneeFilter}
                  onChange={(event) => setAssigneeFilter(event.target.value)}>
                  <option value="">All team members</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="priorityFilter" className="form-label small fw-semibold">Filter by Priority</label>
                <select id="priorityFilter" className="form-select" value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}>
                  <option value="">All</option>
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {loadingIssues ? (
          <div className="text-center text-secondary py-5">
            <span className="spinner-border spinner-border-sm me-2"></span>Loading issues...
          </div>
        ) : (
          <IssueBoard issues={visibleIssues} users={users} />
        )}
      </>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        <Sidebar />
        <div className="col-md-9 col-xl-10 p-0 bg-light">
          <Header searchText={searchText} onSearchChange={setSearchText} />
          <main className="p-3 p-md-4">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}

export default ProjectDashboard;
