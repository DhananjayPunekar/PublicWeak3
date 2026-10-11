import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { AuthContext } from '../context/AuthContext';
import {
  DEFAULT_DESCRIPTION,
  EMPTY_ISSUE,
  ISSUE_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_COLUMNS,
  validateIssue,
} from '../model/Issue';
import { ROLES, isValid } from '../model/User';
import { createIssue } from '../service/issueService';
import { getProjectsByOwner } from '../service/projectService';
import { getAllUsers } from '../service/userService';

/** Every field of the form, all marked as touched (used on submit). */
const ALL_TOUCHED = Object.fromEntries(Object.keys(EMPTY_ISSUE).map((field) => [field, true]));

/**
 * Create Issue screen (Milestone 4) - a React controlled form.
 * Create is enabled only when the form is valid and is disabled while the request runs.
 * On success the user goes to the project board of the issue's project.
 */
function CreateIssue() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form values (all kept as text, as the inputs show them)
  const [form, setForm] = useState(EMPTY_ISSUE);
  // Fields the user has left at least once (their errors become visible)
  const [touched, setTouched] = useState({});
  // Drop-down values: the owner's projects and the assignees
  const [projects, setProjects] = useState([]);
  const [assignees, setAssignees] = useState([]);
  // True while the create request is running
  const [loading, setLoading] = useState(false);
  // Error message from the server (or from loading the drop-downs)
  const [serverError, setServerError] = useState('');

  // Load the Project and Assignee drop-downs once
  useEffect(() => {
    getProjectsByOwner(user.userId)
      .then(setProjects)
      .catch((error) => setServerError(`Could not load your projects: ${error.message}`));
    getAllUsers()
      .then((users) => setAssignees(users.filter((person) => person.role === ROLES.ASSIGNEE)))
      .catch((error) => setServerError(`Could not load assignees: ${error.message}`));
  }, [user]);

  // Validation is recalculated from the current values on every render
  const errors = validateIssue(form);
  const formValid = isValid(errors);

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

  /** Sends the issue to issue-service and opens the project board on success. */
  async function handleSubmit(event) {
    event.preventDefault();
    setTouched(ALL_TOUCHED);
    if (!formValid || loading) return;

    setLoading(true);
    setServerError('');
    try {
      const response = await createIssue({
        summary: form.summary.trim(),
        type: form.type,
        project: Number(form.project),
        description: form.description.trim() || DEFAULT_DESCRIPTION,
        priority: form.priority,
        assignee: Number(form.assignee),
        createdBy: user.userId,
        tags: form.tags.trim(),
        sprint: form.sprint.trim(),
        storyPoint: form.storyPoint.trim() === '' ? null : Number(form.storyPoint),
        status: form.status,
      });
      navigate('/owner/dashboard', {
        state: {
          projectId: response.issue.project,
          message: `Issue #${response.issueId} "${response.issue.summary}" created successfully.`,
        },
      });
    } catch (error) {
      setServerError(error.message);
      setLoading(false);
    }
  }

  /** Reset: all fields blank. */
  function handleReset() {
    setForm({ ...EMPTY_ISSUE, status: '' });
    setTouched({});
    setServerError('');
  }

  /** True when a field's error should be shown. */
  function showError(field) {
    return Boolean(touched[field]) && errors[field] !== '';
  }

  /** Bootstrap classes of an input: red border when its error is shown. */
  function inputClass(field, base = 'form-control') {
    return showError(field) ? `${base} is-invalid` : base;
  }

  /** Validation message under a field, or a hint when there is no error. */
  function messageFor(field, hint) {
    if (showError(field)) {
      return <div id={`${field}-error`} className="invalid-feedback">{errors[field]}</div>;
    }
    return hint ? <div className="form-text">{hint}</div> : null;
  }

  /** Label with a red * for required fields. */
  function label(field, text, required) {
    return (
      <label htmlFor={field} className="form-label fw-semibold small">
        {text} {required && <span className="text-danger">*</span>}
      </label>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        <Sidebar />
        <div className="col-md-9 col-xl-10 p-0 bg-light">
          <Header />
          <main className="p-3 p-md-4">
            <div className="card border-0 shadow-sm" style={{ maxWidth: '960px' }}>
              <div className="card-body p-4">
                <h1 className="h5 fw-bold border-start border-4 border-primary ps-2 mb-4">Create Issue</h1>

                {serverError && <div className="alert alert-danger py-2" role="alert">{serverError}</div>}

                <form noValidate onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Summary */}
                    <div className="col-md-6 mb-3">
                      {label('summary', 'Summary', true)}
                      <input id="summary" name="summary" type="text" maxLength={150} placeholder="Enter summary"
                        className={inputClass('summary')} value={form.summary} onChange={handleChange} onBlur={handleBlur} />
                      {messageFor('summary', 'Up to 150 characters. Allowed special characters: - / | .')}
                    </div>

                    {/* Type */}
                    <div className="col-md-6 mb-3">
                      {label('type', 'Type', true)}
                      <select id="type" name="type" className={inputClass('type', 'form-select')}
                        value={form.type} onChange={handleChange} onBlur={handleBlur}>
                        <option value="">Select type</option>
                        {ISSUE_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {messageFor('type')}
                    </div>

                    {/* Project */}
                    <div className="col-md-6 mb-3">
                      {label('project', 'Project', true)}
                      <select id="project" name="project" className={inputClass('project', 'form-select')}
                        value={form.project} onChange={handleChange} onBlur={handleBlur}>
                        <option value="">Select project</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>{project.projectName}</option>
                        ))}
                      </select>
                      {messageFor('project')}
                    </div>

                    {/* Priority */}
                    <div className="col-md-6 mb-3">
                      {label('priority', 'Priority', true)}
                      <select id="priority" name="priority" className={inputClass('priority', 'form-select')}
                        value={form.priority} onChange={handleChange} onBlur={handleBlur}>
                        <option value="">Select priority</option>
                        {PRIORITY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {messageFor('priority')}
                    </div>

                    {/* Description (optional) */}
                    <div className="col-12 mb-3">
                      {label('description', 'Description', false)}
                      <textarea id="description" name="description" rows={3} maxLength={500} placeholder="Enter description"
                        className={inputClass('description')} value={form.description} onChange={handleChange} onBlur={handleBlur} />
                      {messageFor('description', `${form.description.trim().length}/500 characters (optional)`)}
                    </div>

                    {/* Assignee */}
                    <div className="col-md-6 mb-3">
                      {label('assignee', 'Assignee', true)}
                      <select id="assignee" name="assignee" className={inputClass('assignee', 'form-select')}
                        value={form.assignee} onChange={handleChange} onBlur={handleBlur}>
                        <option value="">Select assignee</option>
                        {assignees.map((person) => (
                          <option key={person.userId} value={person.userId}>{person.name}</option>
                        ))}
                      </select>
                      {messageFor('assignee')}
                    </div>

                    {/* Tags */}
                    <div className="col-md-6 mb-3">
                      {label('tags', 'Tags', false)}
                      <input id="tags" name="tags" type="text" maxLength={100} placeholder="Enter tags"
                        className={inputClass('tags')} value={form.tags} onChange={handleChange} onBlur={handleBlur} />
                      {messageFor('tags', 'Up to 100 characters, e.g. #login, #ui')}
                    </div>

                    {/* Sprint */}
                    <div className="col-md-6 mb-3">
                      {label('sprint', 'Sprint', false)}
                      <input id="sprint" name="sprint" type="text" inputMode="numeric" placeholder="Enter sprint"
                        className={inputClass('sprint')} value={form.sprint} onChange={handleChange} onBlur={handleBlur} />
                      {messageFor('sprint', 'Sprint number: 1, 2, 3 ...')}
                    </div>

                    {/* Story Point */}
                    <div className="col-md-6 mb-3">
                      {label('storyPoint', 'Story Point', false)}
                      <input id="storyPoint" name="storyPoint" type="text" inputMode="numeric" placeholder="Enter story points"
                        className={inputClass('storyPoint')} value={form.storyPoint} onChange={handleChange} onBlur={handleBlur} />
                      {messageFor('storyPoint', 'Prime numbers only: 2, 3, 5, 7, 11, 13 ...')}
                    </div>

                    {/* Status */}
                    <div className="col-md-6 mb-3">
                      {label('status', 'Status', true)}
                      <select id="status" name="status" className={inputClass('status', 'form-select')}
                        value={form.status} onChange={handleChange} onBlur={handleBlur}>
                        <option value="">Select status</option>
                        {STATUS_COLUMNS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {messageFor('status')}
                    </div>
                  </div>

                  <div className="d-flex justify-content-center gap-2 mt-2">
                    <button type="submit" className="btn btn-primary px-4" disabled={!formValid || loading}>
                      {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
                      {loading ? 'Creating...' : 'Create'}
                    </button>
                    <button type="button" className="btn btn-outline-primary px-4" onClick={handleReset} disabled={loading}>
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default CreateIssue;
