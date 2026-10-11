import { useContext, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import userService from '../service/userService';
import { EMPTY_LOGIN, ROLE_OPTIONS, getHomePath, getRoleLabel, isValid, validateLogin } from '../model/User';

/**
 * Login page - a React CONTROLLED form:
 * every input shows the value kept in state and updates it on each keystroke.
 */
function Login() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Form values; the email may be pre-filled after a successful signup
  const [form, setForm] = useState({ ...EMPTY_LOGIN, email: location.state?.email || '' });
  // Fields the user has left at least once (their errors become visible)
  const [touched, setTouched] = useState({ email: false, password: false, role: false });
  // True while the login request is running
  const [loading, setLoading] = useState(false);
  // Error message returned by the server
  const [serverError, setServerError] = useState('');

  // Validation is recalculated from the current values on every render
  const errors = validateLogin(form);
  const formValid = isValid(errors);

  // Already logged in: go straight to the dashboard
  if (user) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  /** Copies the typed value into state (controlled input). */
  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
    setServerError('');
  }

  /** Marks a field as touched when it loses focus. */
  function handleBlur(event) {
    setTouched({ ...touched, [event.target.name]: true });
  }

  /** Calls the login API and opens the dashboard of the user's role. */
  async function handleSubmit(event) {
    event.preventDefault();
    setTouched({ email: true, password: true, role: true });
    if (!formValid) return;

    setLoading(true);
    setServerError('');
    try {
      const response = await userService.login(form.email.trim(), form.password);
      // The account's role must match the role selected on the form
      if (response.user.role !== form.role) {
        setServerError(`This account is registered as ${getRoleLabel(response.user.role)}. Please select the correct role.`);
        return;
      }
      login(response.user);
      navigate(getHomePath(response.user.role), { replace: true });
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  }

  /** Bootstrap classes of an input: red border once a touched field is invalid. */
  function inputClass(field, base = 'form-control') {
    return touched[field] && errors[field] ? `${base} is-invalid` : base;
  }

  return (
    // Centered card with the application name on top
    <main className="min-vh-100 d-flex align-items-center justify-content-center bg-dark bg-gradient p-3">
      <div className="card shadow-lg border-0 w-100" style={{ maxWidth: '440px' }}>
        <div className="card-header bg-primary bg-gradient text-white text-center fw-bold py-3">
          Issue Tracking System
        </div>
        <div className="card-body p-4">
          <h1 className="h4 text-center fw-bold text-body mb-1">Login</h1>
          <p className="text-center text-secondary small mb-4">Sign in to manage your projects and issues</p>
          {serverError && <div className="alert alert-danger py-2" role="alert">{serverError}</div>}

          <form noValidate onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold small">Email address <span className="text-danger">*</span></label>
              <input id="email" name="email" type="email" placeholder="Enter email" className={inputClass('email')}
                value={form.email} onChange={handleChange} onBlur={handleBlur} />
              {touched.email && errors.email && <div id="email-error" className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold small">Password <span className="text-danger">*</span></label>
              <input id="password" name="password" type="password" placeholder="Password" className={inputClass('password')}
                value={form.password} onChange={handleChange} onBlur={handleBlur} />
              {touched.password && errors.password && <div id="password-error" className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="role" className="form-label fw-semibold small">Role <span className="text-danger">*</span></label>
              <select id="role" name="role" className={inputClass('role', 'form-select')}
                value={form.role} onChange={handleChange} onBlur={handleBlur}>
                <option value="">Select your role</option>
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {touched.role && errors.role && <div id="role-error" className="invalid-feedback">{errors.role}</div>}
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={!formValid || loading}>
              {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="text-center small mt-4 mb-0">
            Don&apos;t have an account? <Link to="/signup">Signup</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
