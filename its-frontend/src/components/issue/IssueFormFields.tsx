import type { ChangeEvent, FocusEvent } from 'react';
import { FormGroup } from '../common/FormGroup';
import { controlClass } from '../../utils/formClasses';
import { ISSUE_TYPES, PRIORITIES, STATUSES } from '../../models/issue';
import type { FormErrors } from '../../hooks/useForm';
import type { Project } from '../../models/project';
import type { User } from '../../models/user';
import type { IssueFormValues } from './issueForm';

/** Elements bound to the form state. */
type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** Props of {@link IssueFormFields}. */
interface IssueFormFieldsProps {
  /** 'create' and 'edit' have slightly different rules and hints. */
  mode: 'create' | 'edit';
  values: IssueFormValues;
  errors: FormErrors<IssueFormValues>;
  /** True when the error of a field should be visible. */
  showError: (field: keyof IssueFormValues) => boolean;
  onChange: (event: ChangeEvent<FieldElement>) => void;
  onBlur: (event: FocusEvent<FieldElement>) => void;
  /** Projects for the Project drop-down. */
  projects: readonly Project[];
  /** Users for the Assignee drop-down. */
  users: readonly User[];
}

/**
 * Inputs of the Create Issue and Edit Issue forms, laid out in two columns
 * like the wireframe. The page owns the state; this component only renders.
 */
export function IssueFormFields({ mode, values, errors, showError, onChange, onBlur, projects, users }: IssueFormFieldsProps) {
  const isCreate = mode === 'create';
  const assignees = users.filter((user) => user.role === 'assignee');
  const owners = users.filter((user) => user.role === 'productOwner');
  /** Common props for every bound control. */
  const bind = (field: keyof IssueFormValues) => ({
    id: field,
    name: field,
    value: values[field],
    onChange,
    onBlur,
    'aria-invalid': showError(field),
    'aria-describedby': showError(field) ? `${field}-error` : undefined,
  });

  return (
    <div className="row">
      <FormGroup className="col-md-6" htmlFor="summary" label="Summary" required error={errors.summary} showError={showError('summary')}
        hint={isCreate ? 'Up to 150 characters. Allowed special characters: - / | .' : '5 to 100 characters. Allowed special characters: - / | .'}>
        <input type="text" placeholder="Enter summary" maxLength={isCreate ? 150 : 100}
          className={controlClass('form-control', showError('summary'))} {...bind('summary')} />
      </FormGroup>

      <FormGroup className="col-md-6" htmlFor="type" label="Type" required error={errors.type} showError={showError('type')}>
        <select className={controlClass('form-select', showError('type'))} {...bind('type')}>
          <option value="">Select type</option>
          {ISSUE_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
      </FormGroup>

      <FormGroup className="col-md-6" htmlFor="project" label="Project" required error={errors.project} showError={showError('project')}>
        <select className={controlClass('form-select', showError('project'))} {...bind('project')}>
          <option value="">Select project</option>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}
        </select>
      </FormGroup>

      <FormGroup className="col-md-6" htmlFor="priority" label="Priority" required error={errors.priority} showError={showError('priority')}>
        <select className={controlClass('form-select', showError('priority'))} {...bind('priority')}>
          <option value="">Select priority</option>
          {PRIORITIES.map((priority) => <option key={priority.value} value={priority.value}>{priority.label}</option>)}
        </select>
      </FormGroup>

      <FormGroup className="col-12" htmlFor="description" label="Description" required={!isCreate}
        error={errors.description} showError={showError('description')}
        hint={`${values.description.trim().length}/500 characters${isCreate ? ' (optional)' : ', at least 10'}`}>
        <textarea rows={3} placeholder="Enter description" maxLength={500}
          className={controlClass('form-control', showError('description'))} {...bind('description')} />
      </FormGroup>

      <FormGroup className="col-md-6" htmlFor="assignee" label="Assignee" required error={errors.assignee} showError={showError('assignee')}>
        <select className={controlClass('form-select', showError('assignee'))} {...bind('assignee')}>
          <option value="">Select assignee</option>
          <optgroup label="Assignees">
            {assignees.map((user) => <option key={user.userId} value={user.userId}>{user.name}</option>)}
          </optgroup>
          <optgroup label="Project Owners">
            {owners.map((user) => <option key={user.userId} value={user.userId}>{user.name}</option>)}
          </optgroup>
        </select>
      </FormGroup>

      <FormGroup className="col-md-6" htmlFor="tags" label="Tags" error={errors.tags} showError={showError('tags')}
        hint="Separate several tags with commas, e.g. #login, #ui">
        <input type="text" placeholder="Enter tags" maxLength={100}
          className={controlClass('form-control', showError('tags'))} {...bind('tags')} />
      </FormGroup>

      <FormGroup className="col-md-6" htmlFor="sprint" label="Sprint" required={!isCreate} error={errors.sprint} showError={showError('sprint')}
        hint="Sprint number: 1, 2, 3 ...">
        <input type="text" inputMode="numeric" placeholder="Enter sprint"
          className={controlClass('form-control', showError('sprint'))} {...bind('sprint')} />
      </FormGroup>

      <FormGroup className="col-md-6" htmlFor="storyPoint" label="Story Point" required={!isCreate}
        error={errors.storyPoint} showError={showError('storyPoint')}
        hint={isCreate ? 'Prime numbers only: 2, 3, 5, 7, 11, 13 ...' : 'A positive whole number'}>
        <input type="text" inputMode="numeric" placeholder="Enter story points"
          className={controlClass('form-control', showError('storyPoint'))} {...bind('storyPoint')} />
      </FormGroup>

      <FormGroup className="col-md-6" htmlFor="status" label="Status" required error={errors.status} showError={showError('status')}>
        <select className={controlClass('form-select', showError('status'))} {...bind('status')}>
          <option value="">Select status</option>
          {STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
        </select>
      </FormGroup>
    </div>
  );
}
