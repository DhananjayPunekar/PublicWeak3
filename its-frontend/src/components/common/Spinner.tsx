/** Props of {@link Spinner}. */
interface SpinnerProps {
  /** Text read by screen readers and shown next to the spinner. */
  label?: string;
}

/** Centered loading indicator. */
export function Spinner({ label = 'Loading...' }: SpinnerProps) {
  return (
    <div className="d-flex justify-content-center align-items-center gap-2 py-5 text-secondary" role="status">
      <span className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
