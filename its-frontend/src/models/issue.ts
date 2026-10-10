/**
 * Issue models - mirror the DTOs of issue-service
 * (IssueRequest, UpdateIssueRequest, StatusUpdateRequest, IssueResponse).
 */

/** Workflow status, exactly as issue-service sends it. */
export type IssueStatus = 'TO DO' | 'DEVELOPMENT' | 'TESTING' | 'COMPLETED';
/** Priority levels supported by issue-service. */
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
/** Issue types supported by issue-service. */
export type IssueType = 'BUG' | 'TASK' | 'FEATURE';

/**
 * Status options in board order. `code` is the number from the
 * "Object Value Mapping" table of the requirements.
 */
export const STATUSES: readonly { value: IssueStatus; code: number; label: string }[] = [
  { value: 'TO DO', code: 1, label: 'To Do' },
  { value: 'DEVELOPMENT', code: 2, label: 'Development' },
  { value: 'TESTING', code: 3, label: 'Testing' },
  { value: 'COMPLETED', code: 4, label: 'Completed' },
];

/** Priority options (requirements mapping: 1 = LOW, 2 = MEDIUM, 3 = HIGH). */
export const PRIORITIES: readonly { value: Priority; code: number; label: string }[] = [
  { value: 'LOW', code: 1, label: 'Low' },
  { value: 'MEDIUM', code: 2, label: 'Medium' },
  { value: 'HIGH', code: 3, label: 'High' },
];

/**
 * Type options (requirements mapping: 1 = BUG, 2 = TASK, 3 = STORY).
 * The back end calls the third type FEATURE, so that value is sent.
 */
export const ISSUE_TYPES: readonly { value: IssueType; code: number; label: string }[] = [
  { value: 'BUG', code: 1, label: 'Bug' },
  { value: 'TASK', code: 2, label: 'Task' },
  { value: 'FEATURE', code: 3, label: 'Story / Feature' },
];

/** An issue as returned by issue-service. */
export interface Issue {
  id: number;
  /** Title of the issue. */
  summary: string;
  type: IssueType;
  /** ID of the project the issue belongs to. */
  project: number;
  description: string;
  priority: Priority;
  /** User ID of the assignee. */
  assignee: number;
  /** User ID of the creator (may be missing for imported data). */
  createdBy: number | null;
  /** Tags as free text, e.g. "#login, #ui". */
  tags: string | null;
  /** Sprint as free text, e.g. "2" or "Sprint 2". */
  sprint: string | null;
  storyPoint: number | null;
  status: IssueStatus;
  /** ISO date yyyy-MM-dd. */
  createdOn: string;
  /** ISO date yyyy-MM-dd. */
  lastUpdated: string;
  comments: string | null;
}

/** Body of POST /api/issues. */
export interface IssueRequest {
  summary: string;
  type: IssueType;
  project: number;
  description: string;
  priority: Priority;
  assignee: number;
  createdBy: number;
  tags?: string;
  sprint?: string;
  storyPoint?: number;
  status: IssueStatus;
}

/** Body of PUT /api/issues/{id}: only the fields present are changed. */
export type UpdateIssueRequest = Partial<Omit<IssueRequest, 'createdBy'>>;

/** Body of PATCH /api/issues/{id}/status. */
export interface StatusUpdateRequest {
  status: IssueStatus;
}

/** Response of POST /api/issues. */
export interface IssueCreatedResponse {
  message: string;
  issueId: number;
  issue: Issue;
}

/** Display label of a status value. */
export function statusLabel(status: IssueStatus): string {
  return STATUSES.find((option) => option.value === status)?.label ?? status;
}

/** Display label of an issue type value. */
export function typeLabel(type: IssueType): string {
  return ISSUE_TYPES.find((option) => option.value === type)?.label ?? type;
}
