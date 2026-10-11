/**
 * Project model: field names match project-service
 * ({ id, projectName, productOwner, startDate, endDate }).
 */

/** Shows an ISO date (yyyy-MM-dd) as dd-mm-yyyy, e.g. "2025-06-17" -> "17-06-2025". */
export function formatDate(isoDate) {
  if (!isoDate) return '-';
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  return `${day}-${month}-${year}`;
}

/** Empty Create Project form: { projectName, productOwner, startDate, endDate }. */
export const EMPTY_PROJECT = { projectName: '', productOwner: '', startDate: '', endDate: '' };

// Letters, numbers, spaces and only these special characters: - / | .
const PROJECT_NAME_PATTERN = /^[A-Za-z0-9 \-/|.]+$/;

/** Project Name: required, max 150 characters, no special characters except - / | . */
export function validateProjectName(value) {
  const name = value.trim();
  if (name === '') return 'Project name is required';
  if (name.length > 150) return 'Project name must be at most 150 characters';
  if (!PROJECT_NAME_PATTERN.test(name)) return 'Only letters, numbers, spaces and - / | . are allowed';
  return '';
}

/** Errors of the whole Create Project form ('' = valid). Dates are yyyy-MM-dd strings. */
export function validateProject(form) {
  let endDateError = form.endDate === '' ? 'End date is required' : '';
  if (endDateError === '' && form.startDate !== '' && form.endDate < form.startDate) {
    endDateError = 'End date should not be earlier than the start date';
  }
  return {
    projectName: validateProjectName(form.projectName),
    productOwner: form.productOwner === '' ? 'Project owner is required' : '',
    startDate: form.startDate === '' ? 'Start date is required' : '',
    endDate: endDateError,
  };
}
