import { useEffect, useState } from 'react';
import { BsBellFill } from 'react-icons/bs';
import { issueEvents } from '../../services/issueEvents';
import { statusLabel } from '../../models/issue';

/** A notification on screen. */
interface Toast {
  id: number;
  text: string;
}

/** How long a notification stays visible (milliseconds). */
const TOAST_DURATION_MS = 5000;

/**
 * Shows a short notification whenever an issue changes status. It listens to
 * the issue event hub, so notifications coming from a future real-time
 * channel would appear here too without other changes.
 */
export function NotificationToasts() {
  /** Notifications currently shown. */
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let nextId = 1;
    const timers: number[] = [];
    const unsubscribe = issueEvents.subscribe((event) => {
      if (event.type !== 'status-changed') {
        return;
      }
      const toast: Toast = {
        id: nextId++,
        text: `Issue #${event.issue.id} moved from ${statusLabel(event.previousStatus)} to ${statusLabel(event.issue.status)}.`,
      };
      setToasts((current) => [...current, toast]);
      timers.push(window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== toast.id)), TOAST_DURATION_MS));
    });
    return () => {
      unsubscribe();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast show align-items-center border-0 shadow its-toast" role="status">
          <div className="d-flex">
            <div className="toast-body d-flex align-items-center gap-2">
              <BsBellFill aria-hidden="true" />
              {toast.text}
            </div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Close"
              onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} />
          </div>
        </div>
      ))}
    </div>
  );
}
