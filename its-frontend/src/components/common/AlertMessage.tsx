import type { ReactNode } from 'react';

/** Props of {@link AlertMessage}. */
interface AlertMessageProps {
  /** Bootstrap colour of the alert. */
  variant: 'success' | 'danger' | 'warning' | 'info';
  /** Content of the alert. */
  children: ReactNode;
  /** When given, a close button is shown that calls this function. */
  onClose?: () => void;
}

/** Bootstrap alert used for server errors and success messages. */
export function AlertMessage({ variant, children, onClose }: AlertMessageProps) {
  return (
    <div className={`alert alert-${variant} d-flex align-items-start gap-2 py-2 ${onClose ? 'alert-dismissible' : ''}`} role="alert">
      <div className="flex-grow-1">{children}</div>
      {onClose && <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />}
    </div>
  );
}
