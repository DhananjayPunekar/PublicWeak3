import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormGroup } from '../../components/common/FormGroup';
import { controlClass } from '../../utils/formClasses';
import { AlertMessage } from '../../components/common/AlertMessage';
import { useLayoutContext } from '../../components/layout/layoutContext';
import { useCurrentUser } from '../../hooks/useAuth';
import { useForm, type FormErrors } from '../../hooks/useForm';
import { useUsers } from '../../hooks/useUsers';
import { projectService } from '../../services/projectService';
import { getErrorMessage } from '../../services/httpClient';
import { PATHS } from '../../routes/paths';
import type { NavigationState } from '../../routes/navigationState';
import { validateDateRange, validateRequired, validateTitle } from '../../utils/validators';
import { formatDate } from '../../utils/date';

/** Values of the Create Project form (all kept as text). */
interface ProjectFormValues extends Record<string, string> {
  projectName: string;
  /** User ID of the selected Project Owner. */
  productOwner: string;
  /** yyyy-MM-dd from the date picker. */
  startDate: string;
  endDate: string;
}

/** Values after "Reset": every field blank. */
const BLANK: ProjectFormValues = { projectName: '', productOwner: '', startDate: '', endDate: '' };

/** Validation rules of the Create Project form. */
function validateProject(values: ProjectFormValues): FormErrors<ProjectFormValues> {
  return {
    projectName: validateTitle(values.projectName, 'Project name', 150),
    productOwner: validateRequired(values.productOwner, 'Project owner'),
    startDate: validateRequired(values.startDate, 'Start date'),
    endDate: validateRequired(values.endDate, 'End date') ?? validateDateRange(values.startDate, values.endDate),
  };
}

/**
 * Create Project screen (Project Owner). Controlled form with live
 * validation; on success the user goes to the dashboard of the new project.
 */
export function CreateProjectPage() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const { refreshStats } = useLayoutContext();
  const { users, loading: usersLoading, error: usersError } = useUsers();

  /** The logged-in owner is pre-selected as the project owner. */
  const initialValues = useMemo<ProjectFormValues>(() => ({ ...BLANK, productOwner: String(user.userId) }), [user.userId]);
  const form = useForm(initialValues, validateProject);
  const { values, errors, isValid, handleChange, handleBlur, showError, touchAll, reset } = form;

  /** True while the create request is running. */
  const [submitting, setSubmitting] = useState(false);
  /** Error message from the server. */
  const [serverError, setServerError] = useState<string | null>(null);

  /** Users who can own a project (role Project Owner). */
  const owners = useMemo(() => users.filter((candidate) => candidate.role === 'productOwner'), [users]);

  /** Sends the project to the back end. */
  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    touchAll();
    if (!isValid || submitting) {
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      const response = await projectService.createProject({
        projectName: values.projectName.trim(),
        productOwner: Number(values.productOwner),
        startDate: values.startDate,
        endDate: values.endDate,
      });
      refreshStats();
      const state: NavigationState = { flash: `Project "${response.project.projectName}" created successfully.` };
      navigate(`${PATHS.ownerDashboard}?projectId=${response.projectId}`, { state });
    } catch (error) {
      setServerError(getErrorMessage(error));
      setSubmitting(false);
    }
  }, [isValid, submitting, touchAll, values, refreshStats, navigate]);

  /** "Reset": all fields blank. */
  function handleReset() {
    reset(BLANK);
    setServerError(null);
  }

  return (
    <section className="card border-0 shadow-sm form-card" aria-labelledby="create-project-title">
      <div className="card-body p-4">
        <h1 id="create-project-title" className="h5 fw-bold mb-4">Create Project</h1>

        {serverError && (
          <AlertMessage variant="danger" onClose={() => setServerError(null)}>
            {serverError}
          </AlertMessage>
        )}
        {usersError && <AlertMessage variant="warning">Could not load project owners: {usersError}</AlertMessage>}

        <form noValidate onSubmit={handleSubmit} aria-label="Create project form">
          <div className="row">
            <FormGroup className="col-md-6" htmlFor="projectName" label="Project Name" required
              error={errors.projectName} showError={showError('projectName')}
              hint="Up to 150 characters. Allowed special characters: - / | .">
              <input id="projectName" name="projectName" type="text" placeholder="Enter project name" maxLength={150}
                className={controlClass('form-control', showError('projectName'))}
                value={values.projectName} onChange={handleChange} onBlur={handleBlur} />
            </FormGroup>

            <FormGroup className="col-md-6" htmlFor="productOwner" label="Project Owner" required
              error={errors.productOwner} showError={showError('productOwner')}>
              <select id="productOwner" name="productOwner" className={controlClass('form-select', showError('productOwner'))}
                value={values.productOwner} onChange={handleChange} onBlur={handleBlur} disabled={usersLoading}>
                <option value="">{usersLoading ? 'Loading owners...' : 'Select project owner'}</option>
                {owners.map((owner) => (
                  <option key={owner.userId} value={owner.userId}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            </FormGroup>

            <FormGroup className="col-md-6" htmlFor="startDate" label="Project Start Date" required
              error={errors.startDate} showError={showError('startDate')}
              hint={values.startDate ? `Selected: ${formatDate(values.startDate)}` : 'Format: dd-mm-yyyy'}>
              <input id="startDate" name="startDate" type="date" className={controlClass('form-control', showError('startDate'))}
                value={values.startDate} onChange={handleChange} onBlur={handleBlur} />
            </FormGroup>

            <FormGroup className="col-md-6" htmlFor="endDate" label="Project End Date" required
              error={errors.endDate} showError={showError('endDate') || (values.endDate !== '' && errors.endDate !== null)}
              hint={values.endDate ? `Selected: ${formatDate(values.endDate)}` : 'Format: dd-mm-yyyy'}>
              <input id="endDate" name="endDate" type="date" min={values.startDate || undefined}
                className={controlClass('form-control', showError('endDate') || (values.endDate !== '' && errors.endDate !== null))}
                value={values.endDate} onChange={handleChange} onBlur={handleBlur} />
            </FormGroup>
          </div>

          <div className="d-flex justify-content-center gap-2 mt-2">
            <button type="submit" className="btn btn-primary px-4" disabled={!isValid || submitting}>
              {submitting && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
              {submitting ? 'Creating...' : 'Create'}
            </button>
            <button type="button" className="btn btn-outline-primary px-4" onClick={handleReset} disabled={submitting}>
              Reset
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
