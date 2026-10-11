import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import IssueBoard from './IssueBoard';
import { AuthContext } from '../context/AuthContext';
import { filterIssues } from '../model/Issue';
import { getAssignedIssues } from '../service/userService';

/**
 * Assignee Dashboard (Milestone 6).
 * The issues assigned to the logged-in user, as cards in To Do / Development / Testing / Completed.
 * The search bar filters them in the browser (RegEx on summary and description).
 */
function AssigneeDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Issues assigned to the logged-in user (null while loading)
  const [issues, setIssues] = useState(null);
  // Text typed in the header search bar
  const [searchText, setSearchText] = useState('');
  // Error message when the issues cannot be loaded
  const [error, setError] = useState('');

  // Load the assigned issues once
  useEffect(() => {
    getAssignedIssues(user.userId)
      .then(setIssues)
      .catch((loadError) => {
        setIssues([]);
        setError(loadError.message);
      });
  }, [user]);

  // Search only - no assignee or priority filter on this screen
  const visibleIssues = filterIssues(issues || [], searchText, '', '');

  /** Main area: loading, error, empty state or the board. */
  function renderContent() {
    if (issues === null) {
      return (
        <div className="text-center text-secondary py-5">
          <span className="spinner-border spinner-border-sm me-2"></span>Loading your issues...
        </div>
      );
    }
    return (
      <>
        <h1 className="h5 fw-bold text-uppercase mb-3">My Issues</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        {!error && issues.length === 0 ? (
          <div className="text-center py-5">
            <h2 className="h5 fw-semibold">No issues assigned to you yet</h2>
            <p className="text-secondary">Issues assigned to you by a project owner will appear here.</p>
          </div>
        ) : (
          <>
            {visibleIssues.length === 0 && issues.length > 0 && (
              <p className="text-secondary small">No issues match the search.</p>
            )}
            {/* The logged-in user is the assignee of every card */}
            <IssueBoard issues={visibleIssues} users={[user]} onOpen={(issue) => navigate(`/assignee/issues/${issue.id}`)} />
          </>
        )}
      </>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        <Sidebar />
        <div className="col-md-9 col-xl-10 p-0 bg-light">
          <Header searchText={searchText} onSearchChange={setSearchText} />
          <main className="p-3 p-md-4">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}

export default AssigneeDashboard;
