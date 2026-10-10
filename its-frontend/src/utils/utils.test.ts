import { describe, expect, it } from 'vitest';
import { formatDate } from './date';
import { buildSearchRegex, filterIssuesBySearch } from './search';
import { joinTags, parseTags } from './tags';
import type { Issue } from '../models/issue';

/** Minimal issue for the search tests. */
function issue(id: number, summary: string, description: string): Issue {
  return {
    id, summary, description, type: 'BUG', project: 1, priority: 'LOW', assignee: 1, createdBy: null,
    tags: null, sprint: null, storyPoint: null, status: 'TO DO', createdOn: '2026-01-01', lastUpdated: '2026-01-01', comments: null,
  };
}

describe('formatDate', () => {
  it('shows ISO dates as dd-mm-yyyy', () => {
    expect(formatDate('2025-06-17')).toBe('17-06-2025');
    expect(formatDate('2025-06-17T05:30:00')).toBe('17-06-2025');
    expect(formatDate(null)).toBe('-');
  });
});

describe('search', () => {
  const issues = [issue(1, 'Login button not responsive', 'Users report...'), issue(2, 'Add delivery time', 'Show estimated delivery')];
  it('matches summary or description, case-insensitively', () => {
    expect(filterIssuesBySearch(issues, 'login')).toHaveLength(1);
    expect(filterIssuesBySearch(issues, 'ESTIMATED')).toHaveLength(1);
    expect(filterIssuesBySearch(issues, '')).toHaveLength(2);
  });
  it('supports regular expressions and falls back to literal text', () => {
    expect(filterIssuesBySearch(issues, 'login|delivery')).toHaveLength(2);
    expect(buildSearchRegex('(')?.test('a(b')).toBe(true);
  });
});

describe('tags', () => {
  it('splits comma and hash separated tags', () => {
    expect(parseTags('#login, #ui')).toEqual(['#login', '#ui']);
    expect(parseTags('#delivery #feature')).toEqual(['#delivery', '#feature']);
    expect(parseTags('User Management')).toEqual(['User Management']);
    expect(parseTags(null)).toEqual([]);
  });
  it('joins tags', () => {
    expect(joinTags(['#a', ' #b ', ''])).toBe('#a, #b');
  });
});
