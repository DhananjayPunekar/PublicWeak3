import { useMemo, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { FormGroup, controlClass } from '../../components/common/FormGroup';
import { AlertMessage } from '../../components/common/AlertMessage';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { getErrorMessage } from '../../services/httpClient';
import { homePathFor, PATHS } from '../../routes/paths';
import { ROLE_LABELS, ROLES, type Role } from '../../models/user';
import { allValid, validateEmail, validateLoginPassword, validateRole } from '../../utils/validators';

/** Values of the login form. */
interface LoginFormValues {
  email: string;
  password: string;
  /** Selected role; '' until the user picks one. */
  role: Role | '';
}

/** Which fields the user has interacted with (errors are shown only for these). */
type TouchedFields = Record<keyof LoginFormValues, boolean>;

/** Empty form. */
const INITIAL_VALUES: LoginFormValues = { email: '', password: '', role: '' };
/** Nothing touched yet. */
const UNTOUCHED: TouchedFields = { email: false, password: false, role: false };

/** Location state set by ProtectedRoute or the Signup page. */
interface LoginLocationState {
  /** Page the user tried to open before being sent to login. */
  from?: string;
  /** Email to pre-fill (after sign-up). */
  email?: string;
}

/**
 * Login page - implemented as a React **controlled** form: every input's
 * value lives in React state and is updated on each keystroke.
 */
export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? {}) as LoginLocationState;

  /** Current form values (single source of truth for the inputs). */
  const [values, setValues] = useState<LoginFormValues>({
    ...INITIAL_VALUES,
    email: locationState.email ?? '',
  });
  /** Fields the user has visited. */
  const [touched, setTouched] = useState<TouchedFields>(UNTOUCHED);
  /** True while the login request is running. */
  const [submitting, setSubmitting] = useState(false);
  /** Error returned by the server (wrong password, server down, ...). */
  const [serverError, setServerError] = useState<string | null>(null);

  /** Validation result for every field, recalculated when the values change. */
  const errors = useMemo(
    () => ({
      email: validateEmail(values.email),
      password: validateLoginPassword(values.password),
      role: validateRole(values.role),
    }),
    [values],
  );
  /** The Login button is enabled only when the whole form is valid. */
  const formValid = allValid(errors);

  // Already logged in - go straight to the dashboard.
  if (user) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  /** Updates the changed field in state (controlled input). */
  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setServerError(null);
  }

  /** Marks a field as touched when it loses focus, so its error becomes visible. */
  function handleBlur(event: FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    const field = event.target.name as keyof LoginFormValues;
    setTouched((previous) => ({ ...previous, [field]: true }));
  }

  /** Calls the login API and opens the dashboard for the user's role. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ email: true, password: true, role: true });
    if (!formValid || submitting || values.role === '') {
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      const response = await userService.login({ email: values.email.trim(), password: values.password });
      // The account's role must match the role picked on the form.
      if (response.user.role !== values.role) {
        setServerError(
          `This account is registered as ${ROLE_LABELS[response.user.role]}. Please select the correct role.`,
        );
        return;
      }
      login(response.user);
      const home = homePathFor(response.user.role);
      // Return to the page the user originally asked for, if it belongs to their area (/owner or /assignee).
      const area = `/${home.split('/')[1]}/`;
      const target = locationState.from?.startsWith(area) ? locationState.from : home;
      navigate(target, { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Login" subtitle="Sign in to manage your projects and issues">
      {serverError && (
        <AlertMessage variant="danger" onClose={() => setServerError(null)}>
          {serverError}
        </AlertMessage>
      )}

      <form noValidate onSubmit={handleSubmit} aria-label="Login form">
        <FormGroup htmlFor="email" label="Email address" error={errors.email} showError={touched.email} required>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter email"
            className={controlClass('form-control', touched.email && errors.email !== null)}
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </FormGroup>

        <FormGroup htmlFor="password" label="Password" error={errors.password} showError={touched.password} required>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            className={controlClass('form-control', touched.password && errors.password !== null)}
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </FormGroup>

        <FormGroup htmlFor="role" label="Role" error={errors.role} showError={touched.role} required>
          <select
            id="role"
            name="role"
            className={controlClass('form-select', touched.role && errors.role !== null)}
            value={values.role}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">Select your role</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </FormGroup>

        <button type="submit" className="btn btn-primary w-100 mt-2" disabled={!formValid || submitting}>
          {submitting && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
          {submitting ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <p className="text-center small mt-4 mb-0">
        Don&apos;t have an account? <Link to={PATHS.signup}>Signup</Link>
      </p>
    </AuthLayout>
  );
}
