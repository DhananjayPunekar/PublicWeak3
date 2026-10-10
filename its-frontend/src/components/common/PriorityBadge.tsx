import type { Priority } from '../../models/issue';

/** Bootstrap colour for each priority. */
const PRIORITY_STYLES: Record<Priority, string> = {
  HIGH: 'text-bg-danger',
  MEDIUM: 'text-bg-warning',
  LOW: 'text-bg-success',
};

/** Small coloured pill showing an issue's priority. */
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge rounded-pill priority-badge ${PRIORITY_STYLES[priority]}`}>
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}
