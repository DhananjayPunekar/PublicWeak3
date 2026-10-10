import { BsCheck2Square, BsCodeSlash, BsListTask, BsBugFill } from 'react-icons/bs';
import type { IconType } from 'react-icons';
import { IssueCard } from './IssueCard';
import { STATUSES, type Issue, type IssueStatus } from '../../models/issue';
import type { User } from '../../models/user';

/** Icon and CSS modifier for each status column. */
const COLUMN_STYLES: Record<IssueStatus, { icon: IconType; modifier: string }> = {
  'TO DO': { icon: BsListTask, modifier: 'todo' },
  DEVELOPMENT: { icon: BsCodeSlash, modifier: 'dev' },
  TESTING: { icon: BsBugFill, modifier: 'test' },
  COMPLETED: { icon: BsCheck2Square, modifier: 'done' },
};

/** Props of {@link IssueBoard}. */
interface IssueBoardProps {
  /** Issues to show (already filtered). */
  issues: readonly Issue[];
  /** Users by ID, to show assignee names and photos. */
  usersById: ReadonlyMap<number, User>;
  /** Called when an issue card is clicked. */
  onOpen: (issue: Issue) => void;
}

/** Kanban board with one column per status: To Do, Development, Testing, Completed. */
export function IssueBoard({ issues, usersById, onOpen }: IssueBoardProps) {
  return (
    <div className="row g-3 issue-board">
      {STATUSES.map(({ value, label }) => {
        const columnIssues = issues.filter((issue) => issue.status === value);
        const { icon: Icon, modifier } = COLUMN_STYLES[value];
        return (
          <section key={value} className="col-12 col-sm-6 col-xl-3" aria-label={`${label} column`}>
            <div className={`board-column board-column--${modifier} rounded-3 h-100`}>
              <h2 className="board-column-header h6 text-uppercase fw-bold d-flex align-items-center gap-2 px-3 py-2 mb-0">
                <Icon aria-hidden="true" />
                {label}
                <span className="badge rounded-pill board-count ms-auto" data-testid={`count-${modifier}`}>
                  {columnIssues.length}
                </span>
              </h2>
              <div className="d-flex flex-column gap-2 p-2">
                {columnIssues.length === 0 ? (
                  <p className="text-secondary small text-center my-3">No issues</p>
                ) : (
                  columnIssues.map((issue) => (
                    <IssueCard key={issue.id} issue={issue} assignee={usersById.get(issue.assignee)} onOpen={onOpen} />
                  ))
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
