import { useEffect, useRef, useState, type FocusEvent, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { FormGroup } from '../../components/common/FormGroup';
import { controlClass } from '../../utils/formClasses';
import { AlertMessage } from '../../components/common/AlertMessage';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { getErrorMessage } from '../../services/httpClient';
import { homePathFor, PATHS } from '../../routes/paths';
import { isRole, ROLE_LABELS, ROLES } from '../../models/user';
import { checkImageLoads } from '../../utils/image';
import {
  hasImageExtension,
  validateEmail,
  validateImageUrl,
  validateName,
  validateRole,
  validateSignupPassword,
  type ValidationResult,
} from '../../utils/validators';

/** Names of the sign-up inputs (also their `name` attributes). */
type SignupField = 'name' | 'email' | 'password' | 'profileImage' | 'role';

/** Order of the fields, used to validate them all at once. */
const FIELDS: readonly SignupField[] = ['name', 'email', 'password', 'profileImage', 'role'];

/** Validator for each field. */
const VALIDATORS: Record<SignupField, (value: string) => ValidationResult> = {
  name: validateName,
  email: validateEmail,
  password: validateSignupPassword,
  profileImage: validateImageUrl,
  role: validateRole,
};

/** State of the "does this URL really load as an image?" check. */
type ImageCheck = 'idle' | 'checking' | 'valid' | 'invalid';

/** Errors of an empty form - every field starts invalid. */
function initialErrors(): Record<SignupField, ValidationResult> {
  return {
    name: validateName(''),
    email: validateEmail(''),
    password: validateSignupPassword(''),
    profileImage: validateImageUrl(''),
    role: validateRole(''),
  };
}

/** Nothing touched yet. */
const UNTOUCHED: Record<SignupField, boolean> = {
  name: false,
  email: false,
  password: false,
  profileImage: false,
  role: false,
};

/** Type guard: true if a string is one of the sign-up field names. */
function isSignupField(name: string): name is SignupField {
  return (FIELDS as readonly string[]).includes(name);
}

/** Returns the sign-up field an event came from, or null for other elements. */
function fieldOf(target: EventTarget): SignupField | null {
  if ((target instanceof HTMLInputElement || target instanceof HTMLSelectElement) && isSignupField(target.name)) {
    return target.name;
  }
  return null;
}

/**
 * Sign-up page - implemented as a React **uncontrolled** form: the browser
 * DOM keeps the input values (no `value` props, no state per keystroke).
 * Values are read through a form ref only when validating and submitting.
 */
export function SignupPage() {
  const { user } = useAuth();

  /** Reference to the <form>; the inputs are read from it. */
  const formRef = useRef<HTMLFormElement>(null);
  /** URL currently being checked, so results of older checks are ignored. */
  const latestImageUrl = useRef('');
  /** Debounce timer for the image check. */
  const imageTimer = useRef<number | undefined>(undefined);
  /** URLs already checked (URL -> loaded?), so a URL is never checked twice. */
  const checkedImages = useRef(new Map<string, boolean>());

  /** Current validation message per field (null = valid). */
  const [errors, setErrors] = useState<Record<SignupField, ValidationResult>>(initialErrors);
  /** Fields the user has interacted with. */
  const [touched, setTouched] = useState<Record<SignupField, boolean>>(UNTOUCHED);
  /** Result of loading the profile image URL. */
  const [imageCheck, setImageCheck] = useState<ImageCheck>('idle');
  /** URL shown as a small preview once it is known to be an image. */
  const [previewUrl, setPreviewUrl] = useState('');
  /** True while the sign-up request is running. */
  const [submitting, setSubmitting] = useState(false);
  /** Error returned by the server (e.g. email already registered). */
  const [serverError, setServerError] = useState<string | null>(null);
  /** Success message and email of the account just created. */
  const [created, setCreated] = useState<{ message: string; email: string } | null>(null);

  // Cancel a pending image check when leaving the page.
  useEffect(() => () => window.clearTimeout(imageTimer.current), []);

  if (user) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  /** Reads the current DOM value of a field. */
  function readField(field: SignupField): string {
    const element = formRef.current?.elements.namedItem(field);
    if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
      return element.value;
    }
    return '';
  }

  /** Checks (debounced) that the profile URL really loads as an image. */
  function scheduleImageCheck(url: string, formatError: ValidationResult) {
    window.clearTimeout(imageTimer.current);
    latestImageUrl.current = url;
    if (formatError !== null) {
      setImageCheck('idle');
      setPreviewUrl('');
      return;
    }
    const known = hasImageExtension(url) ? true : checkedImages.current.get(url);
    if (known !== undefined) {
      setImageCheck(known ? 'valid' : 'invalid');
      setPreviewUrl(known ? url : '');
      return;
    }
    setImageCheck('checking');
    setPreviewUrl('');
    imageTimer.current = window.setTimeout(() => {
      void checkImageLoads(url).then((loaded) => {
        checkedImages.current.set(url, loaded);
        if (latestImageUrl.current === url) {
          setImageCheck(loaded ? 'valid' : 'invalid');
          setPreviewUrl(loaded ? url : '');
        }
      });
    }, 500);
  }

  /** Validates one field from its DOM value. */
  function validateField(field: SignupField) {
    const value = readField(field);
    const message = VALIDATORS[field](value);
    setErrors((previous) => ({ ...previous, [field]: message }));
    if (field === 'profileImage') {
      scheduleImageCheck(value.trim(), message);
    }
  }

  /** Any input changed (event delegation on the form). */
  function handleInput(event: FormEvent<HTMLFormElement>) {
    const field = fieldOf(event.target);
    if (field) {
      validateField(field);
      setServerError(null);
    }
  }

  /** A field lost focus: show its validation message from now on. */
  function handleBlur(event: FocusEvent<HTMLFormElement>) {
    const field = fieldOf(event.target);
    if (field) {
      setTouched((previous) => ({ ...previous, [field]: true }));
      validateField(field);
    }
  }

  /** Clears the form and its validation state. */
  function resetForm() {
    formRef.current?.reset();
    window.clearTimeout(imageTimer.current);
    latestImageUrl.current = '';
    setErrors(initialErrors());
    setTouched(UNTOUCHED);
    setImageCheck('idle');
    setPreviewUrl('');
  }

  /** Reads the values with FormData and calls the sign-up API. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = formRef.current;
    if (!form) {
      return;
    }
    setTouched({ name: true, email: true, password: true, profileImage: true, role: true });

    const data = new FormData(form);
    /** Text value of a FormData entry. */
    const text = (field: SignupField) => String(data.get(field) ?? '');
    const freshErrors = Object.fromEntries(FIELDS.map((field) => [field, VALIDATORS[field](text(field))])) as Record<
      SignupField,
      ValidationResult
    >;
    setErrors(freshErrors);
    const role = text('role');
    if (Object.values(freshErrors).some((message) => message !== null) || imageCheck !== 'valid' || !isRole(role)) {
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      const response = await userService.signUp({
        name: text('name').trim(),
        email: text('email').trim(),
        password: text('password'),
        profileImage: text('profileImage').trim(),
        role,
      });
      setCreated({ message: response.message, email: response.user.email });
      resetForm();
    } catch (error) {
      setServerError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  /** Message for the profile field: format error first, then the load check. */
  const profileError: ValidationResult =
    errors.profileImage ?? (imageCheck === 'invalid' ? 'This URL does not point to an image that can be loaded' : null);
  /** Signup is enabled only when every field is valid and the image URL works. */
  const formValid = FIELDS.every((field) => errors[field] === null) && imageCheck === 'valid';
  /** Shows the error of a field only after the user interacted with it. */
  const invalid = (field: SignupField, message: ValidationResult = errors[field]) => touched[field] && message !== null;

  return (
    <AuthLayout title="Signup" subtitle="Create an account as a Project Owner or an Assignee">
      {created && (
        <AlertMessage variant="success" onClose={() => setCreated(null)}>
          <strong>{created.message}.</strong>{' '}
          <Link to={PATHS.login} state={{ email: created.email }} className="alert-link">
            Click here to login
          </Link>
        </AlertMessage>
      )}
      {serverError && (
        <AlertMessage variant="danger" onClose={() => setServerError(null)}>
          {serverError}
        </AlertMessage>
      )}

      <form ref={formRef} noValidate onInput={handleInput} onBlur={handleBlur} onSubmit={handleSubmit} aria-label="Signup form">
        <FormGroup htmlFor="name" label="Name" error={errors.name} showError={touched.name} required>
          <input id="name" name="name" type="text" autoComplete="name" placeholder="Enter name"
            className={controlClass('form-control', invalid('name'))} defaultValue="" />
        </FormGroup>

        <FormGroup htmlFor="email" label="Email address" error={errors.email} showError={touched.email} required>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="Enter email"
            className={controlClass('form-control', invalid('email'))} defaultValue="" />
        </FormGroup>

        <FormGroup htmlFor="password" label="Password" error={errors.password} showError={touched.password} required
          hint="At least 8 characters with an uppercase letter, a lowercase letter, a number and a special character.">
          <input id="password" name="password" type="password" autoComplete="new-password" placeholder="Password"
            className={controlClass('form-control', invalid('password'))} defaultValue="" />
        </FormGroup>

        <FormGroup htmlFor="profileImage" label="Profile" error={profileError} showError={touched.profileImage} required
          hint={imageCheck === 'checking' ? 'Checking the image URL...' : 'Link to your profile picture (http/https).'}>
          <div className="d-flex align-items-center gap-2">
            <input id="profileImage" name="profileImage" type="url" placeholder="Provide profile image url"
              className={controlClass('form-control', invalid('profileImage', profileError))} defaultValue="" />
            {imageCheck === 'checking' && <span className="spinner-border spinner-border-sm text-secondary" aria-label="Checking image" />}
            {imageCheck === 'valid' && (
              <img src={previewUrl} alt="Profile preview" className="rounded-circle border object-fit-cover"
                width={38} height={38} />
            )}
          </div>
        </FormGroup>

        <FormGroup htmlFor="role" label="Role" error={errors.role} showError={touched.role} required>
          <select id="role" name="role" className={controlClass('form-select', invalid('role'))} defaultValue="">
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
          {submitting ? 'Creating account...' : 'Signup'}
        </button>
      </form>

      <p className="text-center small mt-4 mb-0">
        Already have an account? <Link to={PATHS.login}>Login</Link>
      </p>
    </AuthLayout>
  );
}
