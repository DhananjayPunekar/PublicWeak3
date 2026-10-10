/**
 * Field validators shared by every form.
 *
 * Each validator returns `null` when the value is valid, otherwise the
 * message to show under the field. They are pure functions, so they are
 * easy to unit test (see validators.test.ts).
 */

/** Result of a validator: null = valid, string = error message. */
export type ValidationResult = string | null;

/** A simple email pattern: something@something.tld (TLD of 2+ letters). */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

/** Names: letters (any language), spaces, apostrophes, dots and hyphens. */
const NAME_PATTERN = /^[\p{L}][\p{L} .'-]*$/u;

/**
 * Free-text titles (project name, issue summary): letters, digits and spaces,
 * plus the only special characters allowed by the requirements: - / | .
 */
export const TITLE_PATTERN = /^[A-Za-z0-9 \-/|.]+$/;

/** File extensions accepted as images without having to load the URL. */
const IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|gif|webp|svg|bmp|avif|ico)$/i;

/** Checks that a value is present. */
export function validateRequired(value: string, label: string): ValidationResult {
  return value.trim() === '' ? `${label} is required` : null;
}

/** Email: required and in name@domain.tld format. */
export function validateEmail(value: string): ValidationResult {
  const email = value.trim();
  if (email === '') {
    return 'Email is required';
  }
  if (email.length > 255) {
    return 'Email must be at most 255 characters';
  }
  return EMAIL_PATTERN.test(email) ? null : 'Enter a valid email address, e.g. name@example.com';
}

/**
 * Password on the login form: required, 6-100 characters, no spaces.
 * (6 is the back end's minimum, so existing accounts can always log in.)
 */
export function validateLoginPassword(value: string): ValidationResult {
  if (value === '') {
    return 'Password is required';
  }
  if (/\s/.test(value)) {
    return 'Password must not contain spaces';
  }
  if (value.length < 6 || value.length > 100) {
    return 'Password must be between 6 and 100 characters';
  }
  return null;
}

/**
 * Password on the sign-up form: 8-100 characters with at least one
 * uppercase letter, one lowercase letter, one digit and one special character.
 */
export function validateSignupPassword(value: string): ValidationResult {
  if (value === '') {
    return 'Password is required';
  }
  if (/\s/.test(value)) {
    return 'Password must not contain spaces';
  }
  if (value.length < 8 || value.length > 100) {
    return 'Password must be between 8 and 100 characters';
  }
  if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    return 'Password needs an uppercase letter, a lowercase letter, a number and a special character';
  }
  return null;
}

/** Full name: required, not blank, 2-50 characters, letters only (plus . ' -). */
export function validateName(value: string): ValidationResult {
  const name = value.trim();
  if (name === '') {
    return 'Name is required';
  }
  if (name.length < 2 || name.length > 50) {
    return 'Name must be between 2 and 50 characters';
  }
  return NAME_PATTERN.test(name) ? null : 'Name can only contain letters, spaces, dots, apostrophes and hyphens';
}

/** Role: one of the options must be chosen. */
export function validateRole(value: string): ValidationResult {
  return value === '' ? 'Please select your role' : null;
}

/** True if the URL path ends with a known image extension (query string ignored). */
export function hasImageExtension(url: string): boolean {
  try {
    return IMAGE_EXTENSION_PATTERN.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

/**
 * Profile image URL: required, at most 255 characters and a valid http(s) URL.
 * Whether the URL really points to an image is checked separately (see
 * {@link hasImageExtension} and checkImageLoads in utils/image.ts).
 */
export function validateImageUrl(value: string): ValidationResult {
  const url = value.trim();
  if (url === '') {
    return 'Profile image URL is required';
  }
  if (url.length > 255) {
    return 'Profile image URL must be at most 255 characters';
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'Profile image URL must start with http:// or https://';
    }
  } catch {
    return 'Enter a valid URL, e.g. https://example.com/photo.png';
  }
  return null;
}

/**
 * Title-like text (project name, issue summary): required, length limits and
 * no special characters except - / | .
 */
export function validateTitle(value: string, label: string, maxLength: number, minLength = 1): ValidationResult {
  const text = value.trim();
  if (text === '') {
    return `${label} is required`;
  }
  if (text.length < minLength) {
    return `${label} must be at least ${minLength} characters`;
  }
  if (text.length > maxLength) {
    return `${label} must be at most ${maxLength} characters`;
  }
  return TITLE_PATTERN.test(text) ? null : `${label} can only contain letters, numbers, spaces and - / | .`;
}

/** Optional text with a maximum length. */
export function validateMaxLength(value: string, label: string, maxLength: number): ValidationResult {
  return value.trim().length > maxLength ? `${label} must be at most ${maxLength} characters` : null;
}

/** Required text with minimum and maximum length. */
export function validateLength(value: string, label: string, minLength: number, maxLength: number): ValidationResult {
  const text = value.trim();
  if (text === '') {
    return `${label} is required`;
  }
  if (text.length < minLength) {
    return `${label} must be at least ${minLength} characters`;
  }
  return text.length > maxLength ? `${label} must be at most ${maxLength} characters` : null;
}

/** True if the text is a whole number greater than zero (1, 2, 3 ...). */
export function isPositiveInteger(value: string): boolean {
  return /^[1-9]\d*$/.test(value.trim());
}

/** True if n is a prime number (2, 3, 5, 7, 11 ...). */
export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) {
    return false;
  }
  for (let divisor = 2; divisor * divisor <= n; divisor += 1) {
    if (n % divisor === 0) {
      return false;
    }
  }
  return true;
}

/**
 * Positive whole number field (sprint, story points).
 *
 * @param required whether an empty value is an error
 */
export function validatePositiveInteger(value: string, label: string, required: boolean): ValidationResult {
  if (value.trim() === '') {
    return required ? `${label} is required` : null;
  }
  return isPositiveInteger(value) ? null : `${label} must be a positive whole number (1, 2, 3 ...)`;
}

/** Story points on the Create Issue form: optional, but if given it must be a prime number. */
export function validatePrimeStoryPoint(value: string): ValidationResult {
  if (value.trim() === '') {
    return null;
  }
  if (!/^\d+$/.test(value.trim())) {
    return 'Story points must be a whole number';
  }
  return isPrime(Number(value)) ? null : 'Story points must be a prime number (2, 3, 5, 7, 11, 13 ...)';
}

/** End date must not be before the start date (dates as yyyy-MM-dd). */
export function validateDateRange(startDate: string, endDate: string): ValidationResult {
  if (startDate && endDate && endDate < startDate) {
    return 'End date should not be earlier than the start date';
  }
  return null;
}

/** True when every validation result in the object is null. */
export function allValid(errors: Record<string, ValidationResult>): boolean {
  return Object.values(errors).every((error) => error === null);
}
