import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsInbox } from 'react-icons/bs';
import { IssueBoard } from '../../components/board/IssueBoard';
import { AlertMessage } from '../../components/common/AlertMessage';
import { Spinner } from '../../components/common/Spinner';
import { useLayoutContext } from '../../components/layout/layoutContext';
import { useCurrentUser } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { userService } from '../../services/userService';
import { PATHS } from '../../routes/paths';
import { filterIssuesBySearch } from '../../utils/search';
import type { Issue } from '../../models/issue';
import type { User } from '../../models/user';

/**
 * Assignee Dashboard: the issues assigned to the logged-in user as cards in
 * To Do / Development / Testing / Completed, filtered by the header search.
 */
export function AssigneeDashboardPage() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const { searchText } = useLayoutContext();

  /** GET /api/users/{userId}/issues (user-service asks issue-service). */
  const issuesLoader = useCallback(() => userService.getAssignedIssues(user.userId), [user.userId]);
  const { data: issues, loading, error, reload } = useApi(issuesLoader);

  /** Every card shows the logged-in user as assignee, so no user list is needed. */
  const usersById = useMemo(() => new Map<number, User>([[user.userId, user]]), [user]);
  /** Issues matching the search text. */
  const visibleIssues = useMemo(() => filterIssuesBySearch(issues ?? [], searchText), [issues, searchText]);
  /** Opens the details page of an issue. */
  const openIssue = useCallback((issue: Issue) => navigate(PATHS.assigneeIssue(issue.id)), [navigate]);

  if (loading && !issues) {
    return <Spinner label="Loading your issues..." />;
  }
  if (error) {
    return (
      <AlertMessage variant="danger">
        {error}{' '}
        <button type="button" className="btn btn-link alert-link p-0 align-baseline" onClick={reload}>Try again</button>
      </AlertMessage>
    );
  }

  return (
    <>
      <h1 className="h5 fw-bold text-uppercase mb-3 page-title">My Issues</h1>
      {issues && issues.length === 0 ? (
        <div className="empty-state text-center py-5">
          <BsInbox className="display-4 text-secondary mb-3" aria-hidden="true" />
          <h2 className="h5 fw-semibold">No issues assigned to you yet</h2>
          <p className="text-secondary">Issues assigned to you by a project owner will appear here.</p>
        </div>
      ) : (
        <>
          {visibleIssues.length === 0 && <p className="text-secondary small">No issues match the search.</p>}
          <IssueBoard issues={visibleIssues} usersById={usersById} onOpen={openIssue} />
        </>
      )}
    </>
  );
}
