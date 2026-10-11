import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { AuthContext } from '../context/AuthContext';
import {
  ISSUE_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_COLUMNS,
  issueToForm,
  validateEditIssue,
} from '../model/Issue';
import { ROLES, isValid } from '../model/User';
import { getIssueById, updateIssue } from '../service/issueService';
import { getProjectsByOwner } from '../service/projectService';
import { getAllUsers } from '../service/userService';

/** Every field of the form, all marked as touched. */
const ALL_TOUCHED = {
  summary: true, type: true, project: true, description: true, priority: true,
  assignee: true, tags: true, sprint: true, storyPoint: true, status: true,
};

/**
 * Edit Issue screen for the Project Owner (Milestone 5) - a React controlled form.
 * The form starts with the issue's current values; Reset goes back to them.
 * Edit is enabled only when every required field is valid.
 */
function EditIssue() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  // Issue ID from the URL: /owner/issues/:issueId/edit
  const { issueId } = useParams();

  // Values loaded from the server (used by Reset); null while loading
  const [initialForm, setInitialForm] = useState(null);
  // Current form values
  const [form, setForm] = useState(null);
  // Fields the user has left at least once (their errors become visible)
  const [touched, setTouched] = useState({});
  // Drop-down values
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  // True while the update request is running
  const [loading, setLoading] = useState(false);
  // Error message from the server
  const [serverError, setServerError] = useState('');

  // Load the issue and the drop-down values once
  useEffect(() => {
    getIssueById(issueId)
      .then((issue) => {
        const values = issueToForm(issue);
        setInitialForm(values);
        setForm(values);
      })
      .catch((error) => setServerError(error.message));
    getProjectsByOwner(user.userId).then(setProjects).catch(() => setProjects([]));
    getAllUsers().then(setUsers).catch(() => setUsers([]));
  }, [issueId, user]);

  // Assignees, plus the current assignee even if they have another role
  const assigneeOptions = users.filter((person) =>
    person.role === ROLES.ASSIGNEE || (initialForm && String(person.userId) === initialForm.assignee));

  /** Copies the typed / selected value into state (controlled input). */
  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
    setServerError('');
  }

  /** Marks a field as touched when it loses focus. */
  function handleBlur(event) {
    setTouched({ ...touched, [event.target.name]: true });
  }

  /** Saves the changes and returns to the issue details. */
  async function handleSubmit(event) {
    event.preventDefault();
    setTouched(ALL_TOUCHED);
    if (!isValid(validateEditIssue(form)) || loading) return;

    setLoading(true);
    setServerError('');
    try {
      const updated = await updateIssue(issueId, {
        summary: form.summary.trim(),
        type: form.type,
        project: Number(form.project),
        description: form.description.trim(),
        priority: form.priority,
        assignee: Number(form.assignee),
        tags: form.tags.trim(),
        sprint: form.sprint.trim(),
        storyPoint: Number(form.storyPoint),
        status: form.status,
      });
      navigate(`/owner/issues/${updated.id}`, { state: { message: `Issue #${updated.id} updated successfully.` } });
    } catch (error) {
      setServerError(error.message);
      setLoading(false);
    }
  }

  /** Reset: back to the values loaded from the server. */
  function handleReset() {
    setForm(initialForm);
    setTouched({});
    setServerError('');
  }

  /** Main area: loading, error or the form. */
  function renderContent() {
    if (!form) {
      return serverError ? (
        <div className="alert alert-danger">
          {serverError} <Link to="/owner/dashboard" className="alert-link">Back to the dashboard</Link>
        </div>
      ) : (
        <div className="text-center text-secondary py-5">
          <span className="spinner-border spinner-border-sm me-2"></span>Loading issue...
        </div>
      );
    }

    const errors = validateEditIssue(form);
    const formValid = isValid(errors);

    /** True when a field's error should be shown. */
    const showError = (field) => Boolean(touched[field]) && errors[field] !== '';
    /** Bootstrap classes of an input: red border when its error is shown. */
    const inputClass = (field, base = 'form-control') => (showError(field) ? `${base} is-invalid` : base);
    /** Validation message under a field, or a hint when there is no error. */
    const messageFor = (field, hint) => (showError(field)
      ? <div id={`${field}-error`} className="invalid-feedback">{errors[field]}</div>
      : hint ? <div className="form-text">{hint}</div> : null);
    /** Label with a red * for required fields. */
    const label = (field, text, required = true) => (
      <label htmlFor={field} className="form-label fw-semibold small">
        {text} {required && <span className="text-danger">*</span>}
      </label>
    );

    return (
      <div className="card border-0 shadow-sm" style={{ maxWidth: '960px' }}>
        <div className="card-body p-4">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb small mb-2">
              <li className="breadcrumb-item">
                <Link to="/owner/dashboard" state={{ projectId: Number(initialForm.project) }}>Project Board</Link>
              </li>
              <li className="breadcrumb-item"><Link to={`/owner/issues/${issueId}`}>Issue Details</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Edit</li>
            </ol>
          </nav>
          <h1 className="h5 fw-bold border-start border-4 border-primary ps-2 mb-4">Edit Issue #{issueId}</h1>

          {serverError && <div className="alert alert-danger py-2" role="alert">{serverError}</div>}

          <form noValidate onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                {label('summary', 'Summary')}
                <input id="summary" name="summary" type="text" maxLength={100} className={inputClass('summary')}
                  value={form.summary} onChange={handleChange} onBlur={handleBlur} />
                {messageFor('summary', '5 to 100 characters')}
              </div>

              <div className="col-md-6 mb-3">
                {label('type', 'Type')}
                <select id="type" name="type" className={inputClass('type', 'form-select')}
                  value={form.type} onChange={handleChange} onBlur={handleBlur}>
                  <option value="">Select type</option>
                  {ISSUE_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                {messageFor('type')}
              </div>

              <div className="col-md-6 mb-3">
                {label('project', 'Project')}
                <select id="project" name="project" className={inputClass('project', 'form-select')}
                  value={form.project} onChange={handleChange} onBlur={handleBlur}>
                  <option value="">Select project</option>
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}
                </select>
                {messageFor('project')}
              </div>

              <div className="col-md-6 mb-3">
                {label('priority', 'Priority')}
                <select id="priority" name="priority" className={inputClass('priority', 'form-select')}
                  value={form.priority} onChange={handleChange} onBlur={handleBlur}>
                  <option value="">Select priority</option>
                  {PRIORITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                {messageFor('priority')}
              </div>

              <div className="col-12 mb-3">
                {label('description', 'Description')}
                <textarea id="description" name="description" rows={3} maxLength={500} className={inputClass('description')}
                  value={form.description} onChange={handleChange} onBlur={handleBlur} />
                {messageFor('description', `${form.description.trim().length}/500 characters, at least 10`)}
              </div>

              <div className="col-md-6 mb-3">
                {label('assignee', 'Assignee')}
                <select id="assignee" name="assignee" className={inputClass('assignee', 'form-select')}
                  value={form.assignee} onChange={handleChange} onBlur={handleBlur}>
                  <option value="">Select assignee</option>
                  {assigneeOptions.map((person) => <option key={person.userId} value={person.userId}>{person.name}</option>)}
                </select>
                {messageFor('assignee')}
              </div>

              <div className="col-md-6 mb-3">
                {label('tags', 'Tags', false)}
                <input id="tags" name="tags" type="text" className={inputClass('tags')}
                  value={form.tags} onChange={handleChange} onBlur={handleBlur} />
                {messageFor('tags', 'Optional. Separate several tags with commas, e.g. #login, #ui')}
              </div>

              <div className="col-md-6 mb-3">
                {label('sprint', 'Sprint')}
                <input id="sprint" name="sprint" type="text" inputMode="numeric" className={inputClass('sprint')}
                  value={form.sprint} onChange={handleChange} onBlur={handleBlur} />
                {messageFor('sprint', 'A positive whole number: 1, 2, 3 ...')}
              </div>

              <div className="col-md-6 mb-3">
                {label('storyPoint', 'Story Point')}
                <input id="storyPoint" name="storyPoint" type="text" inputMode="numeric" className={inputClass('storyPoint')}
                  value={form.storyPoint} onChange={handleChange} onBlur={handleBlur} />
                {messageFor('storyPoint', 'A positive whole number')}
              </div>

              <div className="col-md-6 mb-3">
                {label('status', 'Status')}
                <select id="status" name="status" className={inputClass('status', 'form-select')}
                  value={form.status} onChange={handleChange} onBlur={handleBlur}>
                  <option value="">Select status</option>
                  {STATUS_COLUMNS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                {messageFor('status')}
              </div>
            </div>

            <div className="d-flex justify-content-center gap-2 mt-2">
              <button type="submit" className="btn btn-primary px-4" disabled={!formValid || loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
                {loading ? 'Saving...' : 'Edit'}
              </button>
              <button type="button" className="btn btn-outline-primary px-4" onClick={handleReset} disabled={loading}>
                Reset
              </button>
            </div>
          </form>
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

export default EditIssue;
