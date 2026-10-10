import { STATUS_COLUMNS, getPriorityBadgeClass, getPriorityLabel } from '../model/Issue';
import { formatDate } from '../model/Project';
import { getInitials } from '../model/User';

/**
 * Issues as cards in four columns: To Do, Development, Testing, Completed.
 * Each card shows ID, creation date, title, description, assignee (photo + name) and priority.
 * Props: issues (already filtered), users (to find assignee names and photos)
 */
function IssueBoard({ issues, users }) {
  /** The assignee of an issue, or a stand-in when the user is unknown. */
  function findAssignee(userId) {
    return users.find((user) => user.userId === userId) || { name: `User #${userId}`, profileImage: null };
  }

  return (
    <div className="row g-3">
      {STATUS_COLUMNS.map((column) => {
        const columnIssues = issues.filter((issue) => issue.status === column.value);
        return (
          <section key={column.value} className="col-12 col-sm-6 col-xl-3">
            <div className={`bg-body-secondary rounded-3 border-top border-4 border-${column.color} h-100`}>
              {/* Column title with the number of issues */}
              <h2 className="h6 text-uppercase fw-bold d-flex align-items-center px-3 py-2 mb-0">
                {column.label}
                <span className={`badge rounded-pill text-bg-${column.color} ms-auto`} data-testid={`count-${column.value}`}>
                  {columnIssues.length}
                </span>
              </h2>

              <div className="d-flex flex-column gap-2 p-2">
                {columnIssues.length === 0 && <p className="text-secondary small text-center my-3">No issues</p>}

                {columnIssues.map((issue) => {
                  const assignee = findAssignee(issue.assignee);
                  return (
                    <div key={issue.id} data-testid="issue-card" className={`card border-0 border-start border-4 border-${column.color} shadow-sm`}>
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between small text-secondary mb-1">
                          <span className="fw-semibold">#{issue.id}</span>
                          <span>{formatDate(issue.createdOn)}</span>
                        </div>
                        <h3 className="h6 fw-semibold mb-1">{issue.summary}</h3>
                        <p className="small text-secondary text-truncate mb-3">{issue.description}</p>

                        <div className="d-flex align-items-center justify-content-between gap-2">
                          <span className="d-flex align-items-center gap-2 small text-truncate">
                            {assignee.profileImage ? (
                              <img src={assignee.profileImage} alt={assignee.name} width="26" height="26"
                                className="rounded-circle object-fit-cover" />
                            ) : (
                              <span className="rounded-circle bg-secondary text-white d-inline-flex align-items-center justify-content-center fw-semibold flex-shrink-0"
                                style={{ width: '26px', height: '26px', fontSize: '0.7rem' }}>
                                {getInitials(assignee.name)}
                              </span>
                            )}
                            {assignee.name}
                          </span>
                          <span className={getPriorityBadgeClass(issue.priority)}>{getPriorityLabel(issue.priority)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default IssueBoard;
