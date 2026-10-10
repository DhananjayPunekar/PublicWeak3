import { Avatar } from '../common/Avatar';
import { PriorityBadge } from '../common/PriorityBadge';
import { formatDate } from '../../utils/date';
import type { Issue } from '../../models/issue';
import type { User } from '../../models/user';

/** Props of {@link IssueCard}. */
interface IssueCardProps {
  issue: Issue;
  /** The assignee, if known (unknown IDs show "User #id"). */
  assignee: User | undefined;
  /** Opens the issue details. */
  onOpen: (issue: Issue) => void;
}

/**
 * Card showing an issue on the board: ID, creation date, title, description,
 * assignee (photo + name) and priority. The whole card is a button.
 */
export function IssueCard({ issue, assignee, onOpen }: IssueCardProps) {
  const assigneeName = assignee?.name ?? `User #${issue.assignee}`;
  return (
    <button type="button" className="issue-card card text-start w-100 border-0 shadow-sm" onClick={() => onOpen(issue)}
      aria-label={`Issue ${issue.id}: ${issue.summary}`}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between small text-secondary mb-1">
          <span className="fw-semibold">#{issue.id}</span>
          <span>{formatDate(issue.createdOn)}</span>
        </div>
        <h3 className="h6 fw-semibold mb-1 issue-card-title">{issue.summary}</h3>
        <p className="small text-secondary mb-3 issue-card-description">{issue.description}</p>
        <div className="d-flex align-items-center justify-content-between gap-2">
          <span className="d-flex align-items-center gap-2 small min-w-0">
            <Avatar name={assigneeName} src={assignee?.profileImage} size={26} />
            <span className="text-truncate">{assigneeName}</span>
          </span>
          <PriorityBadge priority={issue.priority} />
        </div>
      </div>
    </button>
  );
}
