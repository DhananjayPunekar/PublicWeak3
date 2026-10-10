import type { Issue } from '../models/issue';

/** Escapes characters that have a special meaning in regular expressions. */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Turns the search-bar text into a case-insensitive regular expression.
 * Users may type a real RegEx (e.g. `login|payment`); if the text is not a
 * valid pattern it is matched literally instead. Empty text = no filter (null).
 */
export function buildSearchRegex(searchText: string): RegExp | null {
  const text = searchText.trim();
  if (text === '') {
    return null;
  }
  try {
    return new RegExp(text, 'i');
  } catch {
    return new RegExp(escapeRegex(text), 'i');
  }
}

/** Keeps the issues whose summary or description matches the search text. */
export function filterIssuesBySearch(issues: readonly Issue[], searchText: string): Issue[] {
  const regex = buildSearchRegex(searchText);
  if (!regex) {
    return [...issues];
  }
  return issues.filter((issue) => regex.test(issue.summary) || regex.test(issue.description ?? ''));
}
