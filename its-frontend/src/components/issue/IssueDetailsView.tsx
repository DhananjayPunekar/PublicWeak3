import type { ReactNode } from 'react';
import { Avatar } from '../common/Avatar';
import { PriorityBadge } from '../common/PriorityBadge';
import { TagList } from '../common/TagList';
import { formatDate } from '../../utils/date';
import { statusLabel, typeLabel, type Issue } from '../../models/issue';
import type { Project } from '../../models/project';
import type { User } from '../../models/user';

/** Props of {@link IssueDetailsView}. */
interface IssueDetailsViewProps {
  issue: Issue;
  /** Project of the issue, if loaded. */
  project: Project | null;
  /** Assignee, if known. */
  assignee: User | undefined;
  /** Breadcrumb links shown above the title. */
  breadcrumb: ReactNode;
  /** Controls shown at the top of the side panel (Edit button or status drop-down). */
  actions: ReactNode;
  /** Optional content under the side panel facts (e.g. a Save button). */
  footer?: ReactNode;
}

/** One label/value row of the details lists. */
function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="d-flex gap-2 mb-2 align-items-center">
      <dt className="fact-label small fw-semibold text-secondary">{label}:</dt>
      <dd className="mb-0 small">{children}</dd>
    </div>
  );
}

/**
 * Read-only presentation of an issue, shared by the Project Owner and the
 * Assignee details screens. Each screen supplies its own actions.
 */
export function IssueDetailsView({ issue, project, assignee, breadcrumb, actions, footer }: IssueDetailsViewProps) {
  const assigneeName = assignee?.name ?? `User #${issue.assignee}`;
  return (
    <article className="card border-0 shadow-sm issue-details" aria-labelledby="issue-title">
      <div className="card-body p-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb small mb-2">{breadcrumb}</ol>
        </nav>
        <div className="issue-details-title rounded-3 px-3 py-2 mb-4">
          <span className="small text-secondary">#{issue.id}{project ? ` · ${project.projectName}` : ''}</span>
          <h1 id="issue-title" className="h4 fw-bold mb-0">{issue.summary}</h1>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <h2 className="h6 fw-bold text-secondary-emphasis">Description</h2>
            <p className="issue-description mb-4" data-testid="issue-description">{issue.description}</p>

            <h2 className="h6 fw-bold text-secondary-emphasis">Details</h2>
            <div className="row">
              <dl className="col-sm-6 mb-0">
                <Fact label="Type">{typeLabel(issue.type)}</Fact>
                <Fact label="Tags"><TagList tags={issue.tags} /></Fact>
                <Fact label="Story Points">{issue.storyPoint ?? '-'}</Fact>
              </dl>
              <dl className="col-sm-6 mb-0">
                <Fact label="Sprint">{issue.sprint ?? '-'}</Fact>
                <Fact label="Priority"><PriorityBadge priority={issue.priority} /></Fact>
              </dl>
            </div>
          </div>

          <aside className="col-lg-4">
            <div className="issue-side-panel rounded-3 p-3">
              <div className="mb-3">{actions}</div>
              <dl className="mb-0">
                <Fact label="Status"><span className="fw-semibold text-primary" data-testid="issue-status">{statusLabel(issue.status)}</span></Fact>
                <Fact label="Assignee">
                  <span className="d-inline-flex align-items-center gap-2">
                    <Avatar name={assigneeName} src={assignee?.profileImage} size={24} />
                    {assigneeName}
                  </span>
                </Fact>
                <Fact label="Created On">{formatDate(issue.createdOn)}</Fact>
                <Fact label="Last Updated"><span data-testid="issue-last-updated">{formatDate(issue.lastUpdated)}</span></Fact>
              </dl>
              {footer}
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
