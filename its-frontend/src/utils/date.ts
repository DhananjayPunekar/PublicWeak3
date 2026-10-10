/**
 * Date helpers. The back end exchanges dates as ISO strings (yyyy-MM-dd);
 * the UI shows them as dd-mm-yyyy, as the requirements ask.
 */

/** Formats an ISO date (yyyy-MM-dd, optionally with a time part) as dd-mm-yyyy. */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return '-';
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : isoDate;
}

/** Today's date in the browser's time zone as yyyy-MM-dd (for date inputs). */
export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
