import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { AuthContext } from '../context/AuthContext';
import { EMPTY_PROJECT, validateProject } from '../model/Project';
import { ROLES, isValid } from '../model/User';
import { createProject } from '../service/projectService';
import { getAllUsers } from '../service/userService';

/** No field touched yet. */
const NOT_TOUCHED = { projectName: false, productOwner: false, startDate: false, endDate: false };

/**
 * Create Project screen (Milestone 3) - a React controlled form.
 * Create is enabled only when the form is valid and is disabled while the request runs.
 * On success the user goes to the Project Dashboard with the new project selected.
 */
function CreateProject() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form values; the logged-in user is preselected as Project Owner
  const [form, setForm] = useState({ ...EMPTY_PROJECT, productOwner: String(user.userId) });
  // Fields the user has left at least once (their errors become visible)
  const [touched, setTouched] = useState(NOT_TOUCHED);
  // Users with the Project Owner role, for the drop-down
  const [owners, setOwners] = useState([]);
  // True while the create request is running
  const [loading, setLoading] = useState(false);
  // Error message from the server (or from loading the owners)
  const [serverError, setServerError] = useState('');

  // Load the Project Owner drop-down once
  useEffect(() => {
    getAllUsers()
      .then((users) => setOwners(users.filter((person) => person.role === ROLES.PROJECT_OWNER)))
      .catch((error) => setServerError(`Could not load project owners: ${error.message}`));
  }, []);

  // Validation is recalculated from the current values on every render
  const errors = validateProject(form);
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

  /** Sends the project to project-service and opens the dashboard on success. */
  async function handleSubmit(event) {
    event.preventDefault();
    setTouched({ projectName: true, productOwner: true, startDate: true, endDate: true });
    if (!formValid || loading) return;

    setLoading(true);
    setServerError('');
    try {
      const response = await createProject({
        projectName: form.projectName.trim(),
        productOwner: Number(form.productOwner),
        startDate: form.startDate,
        endDate: form.endDate,
      });
      navigate('/owner/dashboard', {
        state: {
          projectId: response.projectId,
          message: `Project "${response.project.projectName}" created successfully.`,
        },
      });
    } catch (error) {
      setServerError(error.message);
      setLoading(false);
    }
  }

  /** Reset: all fields blank. */
  function handleReset() {
    setForm(EMPTY_PROJECT);
    setTouched(NOT_TOUCHED);
    setServerError('');
  }

  /** True when a field's error should be shown. */
  function showError(field) {
    // The date-range error is shown as soon as both dates are picked
    if (field === 'endDate' && form.endDate !== '' && errors.endDate) return true;
    return touched[field] && errors[field] !== '';
  }

  /** Bootstrap classes of an input: red border when its error is shown. */
  function inputClass(field, base = 'form-control') {
    return showError(field) ? `${base} is-invalid` : base;
  }

  /** Validation message under a field. */
  function errorText(field) {
    return showError(field) ? <div id={`${field}-error`} className="invalid-feedback">{errors[field]}</div> : null;
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
                <h1 className="h5 fw-bold border-start border-4 border-primary ps-2 mb-4">Create Project</h1>

                {serverError && <div className="alert alert-danger py-2" role="alert">{serverError}</div>}

                <form noValidate onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Project Name */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="projectName" className="form-label fw-semibold small">
                        Project Name <span className="text-danger">*</span>
                      </label>
                      <input id="projectName" name="projectName" type="text" maxLength={150} placeholder="Enter project name"
                        className={inputClass('projectName')} value={form.projectName}
                        onChange={handleChange} onBlur={handleBlur} />
                      {errorText('projectName') || (
                        <div className="form-text">Up to 150 characters. Allowed special characters: - / | .</div>
                      )}
                    </div>

                    {/* Project Owner */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="productOwner" className="form-label fw-semibold small">
                        Project Owner <span className="text-danger">*</span>
                      </label>
                      <select id="productOwner" name="productOwner" className={inputClass('productOwner', 'form-select')}
                        value={form.productOwner} onChange={handleChange} onBlur={handleBlur}>
                        <option value="">Select project owner</option>
                        {owners.map((owner) => (
                          <option key={owner.userId} value={owner.userId}>{owner.name} ({owner.email})</option>
                        ))}
                      </select>
                      {errorText('productOwner')}
                    </div>

                    {/* Project Start Date */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="startDate" className="form-label fw-semibold small">
                        Project Start Date <span className="text-danger">*</span>
                      </label>
                      <input id="startDate" name="startDate" type="date" className={inputClass('startDate')}
                        value={form.startDate} onChange={handleChange} onBlur={handleBlur} />
                      {errorText('startDate')}
                    </div>

                    {/* Project End Date (cannot be before the start date) */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="endDate" className="form-label fw-semibold small">
                        Project End Date <span className="text-danger">*</span>
                      </label>
                      <input id="endDate" name="endDate" type="date" min={form.startDate || undefined}
                        className={inputClass('endDate')} value={form.endDate}
                        onChange={handleChange} onBlur={handleBlur} />
                      {errorText('endDate')}
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

export default CreateProject;
