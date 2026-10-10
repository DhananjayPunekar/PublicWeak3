import type { ReactNode } from 'react';

/** Props of {@link FormGroup}. */
interface FormGroupProps {
  /** id of the input, so the label is linked to it. */
  htmlFor: string;
  /** Label text shown above the input. */
  label: string;
  /** Validation message, or null when the value is valid. */
  error: string | null;
  /** Show the message only once the user has interacted with the field. */
  showError: boolean;
  /** Marks the label with a red asterisk. */
  required?: boolean;
  /** Optional help text shown under the input when there is no error. */
  hint?: string;
  /** Extra classes for the wrapper (e.g. grid column classes). */
  className?: string;
  /** The input / select / textarea. */
  children: ReactNode;
}

/**
 * Label + input + validation message, styled with Bootstrap.
 * Works for controlled and uncontrolled inputs alike.
 */
export function FormGroup({ htmlFor, label, error, showError, required = false, hint, className = '', children }: FormGroupProps) {
  const visibleError = showError ? error : null;
  return (
    <div className={`mb-3 ${className}`}>
      <label htmlFor={htmlFor} className="form-label fw-semibold small text-secondary-emphasis">
        {label}
        {required && <span className="text-danger ms-1" aria-hidden="true">*</span>}
      </label>
      {children}
      {visibleError ? (
        <div className="invalid-feedback d-block" id={`${htmlFor}-error`} role="alert">
          {visibleError}
        </div>
      ) : (
        hint && <div className="form-text">{hint}</div>
      )}
    </div>
  );
}
