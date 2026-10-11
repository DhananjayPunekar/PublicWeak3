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

/**
 * Issue type options (requirements mapping: 1 = BUG, 2 = TASK, 3 = STORY).
 * The back end calls the third type FEATURE, so that value is sent.
 */
export const ISSUE_TYPE_OPTIONS = [
  { value: 'BUG', label: 'Bug' },
  { value: 'TASK', label: 'Task' },
  { value: 'FEATURE', label: 'Story / Feature' },
];

/** Empty Create Issue form. Status starts at "TO DO". */
export const EMPTY_ISSUE = {
  summary: '',
  type: '',
  project: '',
  description: '',
  priority: '',
  assignee: '',
  tags: '',
  sprint: '',
  storyPoint: '',
  status: 'TO DO',
};

/**
 * The back end requires a description, but on the Create Issue screen it is
 * optional. When it is left empty this text is saved instead.
 */
export const DEFAULT_DESCRIPTION = 'No description provided.';

// Letters, numbers, spaces and only these special characters: - / | .
const SUMMARY_PATTERN = /^[A-Za-z0-9 \-/|.]+$/;

/** True for prime numbers: 2, 3, 5, 7, 11, 13 ... */
export function isPrime(number) {
  if (!Number.isInteger(number) || number < 2) return false;
  for (let divisor = 2; divisor * divisor <= number; divisor += 1) {
    if (number % divisor === 0) return false;
  }
  return true;
}

/** Errors of the whole Create Issue form ('' = valid). */
export function validateIssue(form) {
  const summary = form.summary.trim();
  let summaryError = '';
  if (summary === '') summaryError = 'Summary is required';
  else if (summary.length > 150) summaryError = 'Summary must be at most 150 characters';
  else if (!SUMMARY_PATTERN.test(summary)) summaryError = 'Only letters, numbers, spaces and - / | . are allowed';

  // Story Point: optional, but if given it must be a prime number
  let storyPointError = '';
  if (form.storyPoint.trim() !== '') {
    if (!/^\d+$/.test(form.storyPoint.trim())) storyPointError = 'Story point must be a whole number';
    else if (!isPrime(Number(form.storyPoint))) storyPointError = 'Story point must be a prime number (2, 3, 5, 7, 11, 13 ...)';
  }

  // Sprint: optional, but if given it must be 1, 2, 3 ...
  const sprintError = form.sprint.trim() !== '' && !/^[1-9]\d*$/.test(form.sprint.trim())
    ? 'Sprint must be a number: 1, 2, 3 ...'
    : '';

  return {
    summary: summaryError,
    type: form.type === '' ? 'Type is required' : '',
    project: form.project === '' ? 'Project is required' : '',
    description: form.description.trim().length > 500 ? 'Description must be at most 500 characters' : '',
    priority: form.priority === '' ? 'Priority is required' : '',
    assignee: form.assignee === '' ? 'Assignee is required' : '',
    tags: form.tags.trim().length > 100 ? 'Tags must be at most 100 characters' : '',
    sprint: sprintError,
    storyPoint: storyPointError,
    status: form.status === '' ? 'Status is required' : '',
  };
}
