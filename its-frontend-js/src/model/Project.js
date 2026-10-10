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
