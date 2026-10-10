import { useContext, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthCard from './AuthCard';
import { AuthContext } from '../context/AuthContext';
import userService from '../service/userService';
import { ROLE_OPTIONS, SIGNUP_FIELDS, getHomePath, isValid, validateSignupField } from '../model/User';

/** Errors of an empty form: every field starts invalid, so Signup starts disabled. */
function emptyFormErrors() {
  const errors = {};
  SIGNUP_FIELDS.forEach((field) => {
    errors[field] = validateSignupField(field, '');
  });
  return errors;
}

/** No field touched yet. */
const NOT_TOUCHED = { name: false, email: false, password: false, profileImage: false, role: false };

/**
 * Signup page - a React UNCONTROLLED form:
 * the inputs keep their own values in the DOM (no value/state per keystroke);
 * the values are read through refs only to validate and to submit.
 */
function Signup() {
  const { user } = useContext(AuthContext);

  // One ref per input, used to read its current value from the DOM
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const profileImageRef = useRef(null);
  const roleRef = useRef(null);
  const refs = { name: nameRef, email: emailRef, password: passwordRef, profileImage: profileImageRef, role: roleRef };

  // Validation message of each field ('' = valid)
  const [errors, setErrors] = useState(emptyFormErrors);
  // Fields the user has interacted with
  const [touched, setTouched] = useState(NOT_TOUCHED);
  // Profile image shown as a preview once its URL is valid
  const [previewUrl, setPreviewUrl] = useState('');
  // True while the signup request is running
  const [loading, setLoading] = useState(false);
  // Error message returned by the server
  const [serverError, setServerError] = useState('');
  // Success message and email of the account just created
  const [created, setCreated] = useState(null);

  if (user) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  /** Reads a field's value from the DOM and validates it. */
  function checkField(field) {
    const value = refs[field].current.value;
    const message = validateSignupField(field, value);
    setErrors((previous) => ({ ...previous, [field]: message }));
    if (field === 'profileImage') {
      setPreviewUrl(message === '' ? value.trim() : '');
    }
  }

  /** Typing in a field: validate it again. */
  function handleInput(event) {
    checkField(event.target.name);
    setServerError('');
  }

  /** Leaving a field: show its message from now on. */
  function handleBlur(event) {
    const field = event.target.name;
    setTouched((previous) => ({ ...previous, [field]: true }));
    checkField(field);
  }

  /** Reads all values from the refs and calls the signup API. */
  async function handleSubmit(event) {
    event.preventDefault();
    const formElement = event.target;

    // Read and validate every field from the DOM
    const values = {};
    const freshErrors = {};
    SIGNUP_FIELDS.forEach((field) => {
      values[field] = refs[field].current.value;
      freshErrors[field] = validateSignupField(field, values[field]);
    });
    setErrors(freshErrors);
    setTouched({ name: true, email: true, password: true, profileImage: true, role: true });
    if (!isValid(freshErrors)) return;

    setLoading(true);
    setServerError('');
    try {
      const response = await userService.signup({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        profileImage: values.profileImage.trim(),
        role: values.role,
      });
      setCreated({ message: response.message, email: response.user.email });
      // Clear the form for the next signup
      formElement.reset();
      setErrors(emptyFormErrors());
      setTouched(NOT_TOUCHED);
      setPreviewUrl('');
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

  /** Validation message under a field (only after the user interacted with it). */
  function errorText(field) {
    return touched[field] && errors[field]
      ? <div id={`${field}-error`} className="invalid-feedback d-block">{errors[field]}</div>
      : null;
  }

  return (
    <AuthCard title="Signup" subtitle="Create an account as a Project Owner or an Assignee">
      {created && (
        <div className="alert alert-success py-2" role="alert">
          <strong>{created.message}.</strong>{' '}
          <Link to="/login" state={{ email: created.email }} className="alert-link">Click here to login</Link>
        </div>
      )}
      {serverError && <div className="alert alert-danger py-2" role="alert">{serverError}</div>}

      <form noValidate onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label fw-semibold small">Name <span className="text-danger">*</span></label>
          <input id="name" name="name" type="text" placeholder="Enter name" ref={nameRef}
            className={inputClass('name')} onInput={handleInput} onBlur={handleBlur} />
          {errorText('name')}
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label fw-semibold small">Email address <span className="text-danger">*</span></label>
          <input id="email" name="email" type="email" placeholder="Enter email" ref={emailRef}
            className={inputClass('email')} onInput={handleInput} onBlur={handleBlur} />
          {errorText('email')}
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label fw-semibold small">Password <span className="text-danger">*</span></label>
          <input id="password" name="password" type="password" placeholder="Password" ref={passwordRef}
            className={inputClass('password')} onInput={handleInput} onBlur={handleBlur} />
          {errorText('password') || (
            <div className="form-text">At least 8 characters with an uppercase letter, a lowercase letter, a number and a special character.</div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="profileImage" className="form-label fw-semibold small">Profile <span className="text-danger">*</span></label>
          <div className="d-flex align-items-center gap-2">
            <input id="profileImage" name="profileImage" type="url" placeholder="Provide profile image url" ref={profileImageRef}
              className={inputClass('profileImage')} onInput={handleInput} onBlur={handleBlur} />
            {previewUrl && (
              <img src={previewUrl} alt="Profile preview" width="38" height="38"
                className="rounded-circle border object-fit-cover flex-shrink-0" />
            )}
          </div>
          {errorText('profileImage')}
        </div>

        <div className="mb-4">
          <label htmlFor="role" className="form-label fw-semibold small">Role <span className="text-danger">*</span></label>
          <select id="role" name="role" defaultValue="" ref={roleRef}
            className={inputClass('role', 'form-select')} onChange={handleInput} onBlur={handleBlur}>
            <option value="">Select your role</option>
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errorText('role')}
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={!isValid(errors) || loading}>
          {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
          {loading ? 'Creating account...' : 'Signup'}
        </button>
      </form>

      <p className="text-center small mt-4 mb-0">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </AuthCard>
  );
}

export default Signup;
