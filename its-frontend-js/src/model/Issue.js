/**
 * Issue model: status / priority values (as issue-service sends them),
 * how they are shown, and the front-end filters of the dashboards.
 */

/** Board columns in order. `color` is the Bootstrap colour of the column. */
export const STATUS_COLUMNS = [
  { value: 'TO DO', label: 'To Do', color: 'danger' },
  { value: 'DEVELOPMENT', label: 'Development', color: 'warning' },
  { value: 'TESTING', label: 'Testing', color: 'info' },
  { value: 'COMPLETED', label: 'Completed', color: 'success' },
];

/** Priority options (requirements mapping: 1 = LOW, 2 = MEDIUM, 3 = HIGH). */
export const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

/** Bootstrap badge classes for each priority. */
export function getPriorityBadgeClass(priority) {
  if (priority === 'HIGH') return 'badge text-bg-danger';
  if (priority === 'MEDIUM') return 'badge text-bg-warning';
  return 'badge text-bg-success';
}

/** "HIGH" -> "High". */
export function getPriorityLabel(priority) {
  const option = PRIORITY_OPTIONS.find((item) => item.value === priority);
  return option ? option.label : priority;
}

/**
 * Turns the search text into a case-insensitive regular expression.
 * Text that is not a valid RegEx (e.g. "(") is searched as plain text.
 */
function buildSearchRegex(searchText) {
  try {
    return new RegExp(searchText, 'i');
  } catch {
    return new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }
}

/**
 * Front-end filtering used by the dashboards.
 * @param issues     issues to filter
 * @param searchText RegEx matched against summary and description ('' = no filter)
 * @param assigneeId user ID ('' = everyone)
 * @param priority   'HIGH' | 'MEDIUM' | 'LOW' ('' = all)
 */
export function filterIssues(issues, searchText, assigneeId, priority) {
  const text = searchText.trim();
  const regex = text === '' ? null : buildSearchRegex(text);

  return issues.filter((issue) =>
    (!regex || regex.test(issue.summary) || regex.test(issue.description || ''))
    && (assigneeId === '' || issue.assignee === Number(assigneeId))
    && (priority === '' || issue.priority === priority));
}
