import { useCallback, useMemo, useState, type ChangeEvent, type FocusEvent } from 'react';
import type { ValidationResult } from '../utils/validators';

/** Form values: every field is kept as text, exactly as the input shows it. */
export type FormValues = Record<string, string>;
/** Validation result for each field of a form. */
export type FormErrors<V extends FormValues> = Record<keyof V, ValidationResult>;
/** Elements whose value can be bound by {@link useForm}. */
type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * State management for a React **controlled** form: values live in state,
 * errors are derived from the values on every render, and a field's error is
 * shown once it has been touched (blurred) or the user tried to submit.
 *
 * @param initialValues values used on first render and by reset()
 * @param validate      returns the error (or null) for every field
 */
export function useForm<V extends FormValues>(initialValues: V, validate: (values: V) => FormErrors<V>) {
  /** Current values of every field. */
  const [values, setValues] = useState<V>(initialValues);
  /** Fields the user has visited. */
  const [touched, setTouched] = useState<Partial<Record<keyof V, boolean>>>({});

  /** Errors for the current values. */
  const errors = useMemo(() => validate(values), [validate, values]);
  /** True when no field has an error. */
  const isValid = Object.values(errors).every((error) => error === null);
  /** True when any value differs from the initial values. */
  const isDirty = (Object.keys(initialValues) as (keyof V)[]).some((key) => values[key] !== initialValues[key]);

  /** onChange handler for inputs whose `name` matches a field. */
  const handleChange = useCallback((event: ChangeEvent<FieldElement>) => {
    const { name, value } = event.target;
    setValues((previous) => (name in previous ? { ...previous, [name]: value } : previous));
  }, []);

  /** onBlur handler: marks the field as touched so its error becomes visible. */
  const handleBlur = useCallback((event: FocusEvent<FieldElement>) => {
    const { name } = event.target;
    setTouched((previous) => ({ ...previous, [name]: true }));
  }, []);

  /** Sets one field programmatically. */
  const setField = useCallback((name: keyof V, value: string) => {
    setValues((previous) => ({ ...previous, [name]: value }));
  }, []);

  /** Marks every field as touched (used when the user tries to submit). */
  const touchAll = useCallback(() => {
    setTouched(Object.fromEntries(Object.keys(initialValues).map((key) => [key, true])) as Record<keyof V, boolean>);
  }, [initialValues]);

  /** Puts the form back to the given values (default: the initial values) and clears touched state. */
  const reset = useCallback((nextValues?: V) => {
    setValues(nextValues ?? initialValues);
    setTouched({});
  }, [initialValues]);

  /** True when the error of a field should be displayed. */
  const showError = useCallback((name: keyof V) => Boolean(touched[name]) && errors[name] !== null, [touched, errors]);

  return { values, errors, touched, isValid, isDirty, handleChange, handleBlur, setField, setValues, touchAll, reset, showError };
}
