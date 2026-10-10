import { describe, expect, it } from 'vitest';
import { BLANK_ISSUE_FORM, DEFAULT_DESCRIPTION, toFormValues, toIssueRequest, validateCreateIssue, validateEditIssue, type IssueFormValues } from './issueForm';
import type { Issue } from '../../models/issue';

/** A valid Create Issue form. */
const VALID: IssueFormValues = {
  ...BLANK_ISSUE_FORM,
  summary: 'Login button not responsive',
  type: 'BUG',
  project: '101',
  priority: 'HIGH',
  assignee: '2',
  status: 'TO DO',
};

describe('validateCreateIssue', () => {
  it('accepts a minimal valid form (description, tags, sprint, story point optional)', () => {
    expect(Object.values(validateCreateIssue(VALID)).every((e) => e === null)).toBe(true);
  });
  it('requires type, project, priority, assignee', () => {
    const errors = validateCreateIssue(BLANK_ISSUE_FORM);
    expect(errors.type).not.toBeNull();
    expect(errors.project).not.toBeNull();
    expect(errors.priority).not.toBeNull();
    expect(errors.assignee).not.toBeNull();
  });
  it('story points must be prime and sprint a positive number', () => {
    expect(validateCreateIssue({ ...VALID, storyPoint: '8' }).storyPoint).not.toBeNull();
    expect(validateCreateIssue({ ...VALID, storyPoint: '13' }).storyPoint).toBeNull();
    expect(validateCreateIssue({ ...VALID, sprint: '0' }).sprint).not.toBeNull();
  });
  it('limits lengths', () => {
    expect(validateCreateIssue({ ...VALID, description: 'x'.repeat(501) }).description).not.toBeNull();
    expect(validateCreateIssue({ ...VALID, tags: 'x'.repeat(101) }).tags).not.toBeNull();
  });
});

describe('validateEditIssue', () => {
  it('requires description (10+), sprint and story points', () => {
    const errors = validateEditIssue({ ...VALID, description: 'short' });
    expect(errors.description).not.toBeNull();
    expect(errors.sprint).not.toBeNull();
    expect(errors.storyPoint).not.toBeNull();
    expect(validateEditIssue({ ...VALID, summary: 'Bug' }).summary).not.toBeNull();
  });
});

describe('mappers', () => {
  it('builds the create request and fills the default description', () => {
    const request = toIssueRequest({ ...VALID, storyPoint: '5', sprint: '2', tags: ' #ui ' }, 1);
    expect(request.description).toBe(DEFAULT_DESCRIPTION);
    expect(request.project).toBe(101);
    expect(request.storyPoint).toBe(5);
    expect(request.tags).toBe('#ui');
    expect(request.createdBy).toBe(1);
  });
  it('keeps only the number of a text sprint when editing', () => {
    const issue: Issue = {
      id: 201, summary: 'Login Feature', type: 'BUG', project: 101, description: 'Implement login', priority: 'HIGH',
      assignee: 2, createdBy: null, tags: 'Authentication', sprint: 'Sprint 1', storyPoint: 5, status: 'TO DO',
      createdOn: '2023-01-10', lastUpdated: '2023-01-15', comments: null,
    };
    expect(toFormValues(issue).sprint).toBe('1');
    expect(toFormValues(issue).storyPoint).toBe('5');
  });
});
