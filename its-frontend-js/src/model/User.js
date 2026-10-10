/**
 * User model: role values, form defaults and validation rules for the
 * Login and Signup forms. Field names match the user-service API.
 */

/** Role values exactly as user-service stores them. */
export const ROLES = {
  PROJECT_OWNER: 'productOwner',
  ASSIGNEE: 'assignee',
};

/** Options for the Role drop-down. */
export const ROLE_OPTIONS = [
  { value: ROLES.PROJECT_OWNER, label: 'Project Owner' },
  { value: ROLES.ASSIGNEE, label: 'Assignee' },
];

/** Empty login form: { email, password, role }. */
export const EMPTY_LOGIN = { email: '', password: '', role: '' };

/** Signup form fields (also the `name` of each input). */
export const SIGNUP_FIELDS = ['name', 'email', 'password', 'profileImage', 'role'];

/** Display label of a role, e.g. "productOwner" -> "Project Owner". */
export function getRoleLabel(role) {
  const option = ROLE_OPTIONS.find((item) => item.value === role);
  return option ? option.label : role;
}

/** Page a user lands on after login, based on the role. */
export function getHomePath(role) {
  return role === ROLES.PROJECT_OWNER ? '/owner/dashboard' : '/assignee/dashboard';
}

// ---------------------------------------------------------------- validators
// Every validator returns '' when the value is valid, otherwise the message to show.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]*$/;
const IMAGE_PATTERN = /\.(png|jpe?g|gif|webp|svg|bmp)$/i;

/** Email: required and in name@domain.com format. */
export function validateEmail(value) {
  const email = value.trim();
  if (email === '') return 'Email is required';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address, e.g. name@example.com';
  return '';
}

/** Login password: required, 6-100 characters (back-end minimum), no spaces. */
export function validateLoginPassword(value) {
  if (value === '') return 'Password is required';
  if (/\s/.test(value)) return 'Password must not contain spaces';
  if (value.length < 6 || value.length > 100) return 'Password must be between 6 and 100 characters';
  return '';
}

/** Signup password: 8-100 characters with upper case, lower case, a number and a special character. */
export function validateSignupPassword(value) {
  if (value === '') return 'Password is required';
  if (/\s/.test(value)) return 'Password must not contain spaces';
  if (value.length < 8 || value.length > 100) return 'Password must be between 8 and 100 characters';
  if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    return 'Password needs an uppercase letter, a lowercase letter, a number and a special character';
  }
  return '';
}

/** Name: required, not blank, 2-50 letters (spaces . ' - allowed). */
export function validateName(value) {
  const name = value.trim();
  if (name === '') return 'Name is required';
  if (name.length < 2 || name.length > 50) return 'Name must be between 2 and 50 characters';
  if (!NAME_PATTERN.test(name)) return 'Name can only contain letters, spaces, dots, apostrophes and hyphens';
  return '';
}

/** Profile image: required, an http(s) URL that ends with an image extension. */
export function validateProfileImage(value) {
  const url = value.trim();
  if (url === '') return 'Profile image URL is required';
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return 'Enter a valid URL, e.g. https://example.com/photo.png';
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return 'The URL must start with http:// or https://';
  if (!IMAGE_PATTERN.test(parsed.pathname)) return 'The URL must point to an image (.png, .jpg, .jpeg, .gif, .webp, .svg)';
  if (url.length > 255) return 'The URL must be at most 255 characters';
  return '';
}

/** Role: one option must be selected. */
export function validateRole(value) {
  return value === '' ? 'Please select your role' : '';
}

/** Errors of the whole login form: { email, password, role }. */
export function validateLogin(form) {
  return {
    email: validateEmail(form.email),
    password: validateLoginPassword(form.password),
    role: validateRole(form.role),
  };
}

/** Error of one signup field. */
export function validateSignupField(field, value) {
  switch (field) {
    case 'name': return validateName(value);
    case 'email': return validateEmail(value);
    case 'password': return validateSignupPassword(value);
    case 'profileImage': return validateProfileImage(value);
    case 'role': return validateRole(value);
    default: return '';
  }
}

/** True when an errors object has no messages. */
export function isValid(errors) {
  return Object.values(errors).every((message) => message === '');
}
