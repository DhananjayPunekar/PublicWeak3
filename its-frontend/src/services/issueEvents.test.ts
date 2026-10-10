import { describe, expect, it } from 'vitest';
import { issueEvents, publishIssueSaved, type IssueEvent } from './issueEvents';
import type { Issue } from '../models/issue';

const ISSUE: Issue = {
  id: 1, summary: 'Login', type: 'BUG', project: 101, description: 'Implement login', priority: 'HIGH', assignee: 2,
  createdBy: 1, tags: null, sprint: '1', storyPoint: 3, status: 'TO DO', createdOn: '2026-01-01', lastUpdated: '2026-01-01', comments: null,
};

describe('issueEvents', () => {
  it('delivers events to subscribers until they unsubscribe', () => {
    const received: IssueEvent['type'][] = [];
    const unsubscribe = issueEvents.subscribe((event) => received.push(event.type));
    publishIssueSaved(ISSUE, { ...ISSUE, status: 'TESTING' });
    unsubscribe();
    publishIssueSaved(ISSUE, { ...ISSUE, status: 'COMPLETED' });
    expect(received).toEqual(['issue-updated', 'status-changed']);
  });
  it('only reports a status change when the status moved', () => {
    const received: IssueEvent['type'][] = [];
    const unsubscribe = issueEvents.subscribe((event) => received.push(event.type));
    publishIssueSaved(ISSUE, { ...ISSUE, summary: 'Login v2' });
    unsubscribe();
    expect(received).toEqual(['issue-updated']);
  });
});
