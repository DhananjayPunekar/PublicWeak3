import type { FormErrors } from '../../hooks/useForm';
import type { Issue, IssueRequest, IssueStatus, IssueType, Priority, UpdateIssueRequest } from '../../models/issue';
import {
  validateLength,
  validateMaxLength,
  validatePositiveInteger,
  validatePrimeStoryPoint,
  validateRequired,
  validateTitle,
} from '../../utils/validators';

/** Values of the Create / Edit Issue forms, all kept as text. */
export interface IssueFormValues extends Record<string, string> {
  summary: string;
  type: IssueType | '';
  /** Project ID. */
  project: string;
  description: string;
  priority: Priority | '';
  /** Assignee user ID. */
  assignee: string;
  tags: string;
  sprint: string;
  storyPoint: string;
  status: IssueStatus | '';
}

/** Every field blank (what "Reset" does on the Create Issue form). */
export const BLANK_ISSUE_FORM: IssueFormValues = {
  summary: '',
  type: '',
  project: '',
  description: '',
  priority: '',
  assignee: '',
  tags: '',
  sprint: '',
  storyPoint: '',
  status: '',
};

/**
 * The back end requires a description, but on the Create Issue screen it is
 * optional. When the user leaves it empty this text is stored instead.
 */
export const DEFAULT_DESCRIPTION = 'No description provided.';

/** Create Issue rules (requirements section 4.5). */
export function validateCreateIssue(values: IssueFormValues): FormErrors<IssueFormValues> {
  return {
    summary: validateTitle(values.summary, 'Summary', 150),
    type: validateRequired(values.type, 'Type'),
    project: validateRequired(values.project, 'Project'),
    description: validateMaxLength(values.description, 'Description', 500),
    priority: validateRequired(values.priority, 'Priority'),
    assignee: validateRequired(values.assignee, 'Assignee'),
    tags: validateMaxLength(values.tags, 'Tags', 100),
    storyPoint: validatePrimeStoryPoint(values.storyPoint),
    sprint: validatePositiveInteger(values.sprint, 'Sprint', false),
    status: validateRequired(values.status, 'Status'),
  };
}

/** Edit Issue rules (requirements section 4.6). */
export function validateEditIssue(values: IssueFormValues): FormErrors<IssueFormValues> {
  return {
    summary: validateTitle(values.summary, 'Summary', 100, 5),
    type: validateRequired(values.type, 'Type'),
    project: validateRequired(values.project, 'Project'),
    description: validateLength(values.description, 'Description', 10, 500),
    priority: validateRequired(values.priority, 'Priority'),
    assignee: validateRequired(values.assignee, 'Assignee'),
    tags: validateMaxLength(values.tags, 'Tags', 100),
    storyPoint: validatePositiveInteger(values.storyPoint, 'Story points', true),
    sprint: validatePositiveInteger(values.sprint, 'Sprint', true),
    status: validateRequired(values.status, 'Status'),
  };
}

/** Text value or undefined when blank (so the back end keeps its default). */
function optional(text: string): string | undefined {
  const trimmed = text.trim();
  return trimmed === '' ? undefined : trimmed;
}

/** Builds the POST /api/issues body from valid form values. */
export function toIssueRequest(values: IssueFormValues, createdBy: number): IssueRequest {
  return {
    summary: values.summary.trim(),
    type: values.type as IssueType,
    project: Number(values.project),
    description: optional(values.description) ?? DEFAULT_DESCRIPTION,
    priority: values.priority as Priority,
    assignee: Number(values.assignee),
    createdBy,
    tags: optional(values.tags),
    sprint: optional(values.sprint),
    storyPoint: values.storyPoint.trim() === '' ? undefined : Number(values.storyPoint),
    status: values.status as IssueStatus,
  };
}

/** Builds the PUT /api/issues/{id} body from valid form values. */
export function toUpdateRequest(values: IssueFormValues): UpdateIssueRequest {
  return {
    summary: values.summary.trim(),
    type: values.type as IssueType,
    project: Number(values.project),
    description: values.description.trim(),
    priority: values.priority as Priority,
    assignee: Number(values.assignee),
    // An empty string tells the back end to clear the tags.
    tags: values.tags.trim(),
    sprint: values.sprint.trim(),
    storyPoint: Number(values.storyPoint),
    status: values.status as IssueStatus,
  };
}

/**
 * Pre-fills the Edit form from an issue. Older data may store the sprint as
 * text like "Sprint 3"; only its number is kept so it fits the numeric field.
 */
export function toFormValues(issue: Issue): IssueFormValues {
  const sprintNumber = /\d+/.exec(issue.sprint ?? '')?.[0] ?? '';
  return {
    summary: issue.summary,
    type: issue.type,
    project: String(issue.project),
    description: issue.description,
    priority: issue.priority,
    assignee: String(issue.assignee),
    tags: issue.tags ?? '',
    sprint: sprintNumber,
    storyPoint: issue.storyPoint === null ? '' : String(issue.storyPoint),
    status: issue.status,
  };
}
