import { useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar, type SidebarStat } from './Sidebar';
import type { LayoutContextValue } from './layoutContext';
import { AlertMessage } from '../common/AlertMessage';
import { NotificationToasts } from '../common/NotificationToasts';
import { useAuth, useCurrentUser } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { projectService } from '../../services/projectService';
import { issueService } from '../../services/issueService';
import { userService } from '../../services/userService';
import { PATHS } from '../../routes/paths';
import { readFlash } from '../../routes/navigationState';
import type { User } from '../../models/user';

/** Counters shown in the sidebar for each role. */
interface Stats {
  projects: number | null;
  issues: number;
}

/** Loads the sidebar counters for the given user. */
async function loadStats(user: User): Promise<Stats> {
  if (user.role === 'productOwner') {
    const [projects, issues] = await Promise.all([
      projectService.getProjectsByOwner(user.userId),
      issueService.getIssuesByOwner(user.userId),
    ]);
    return { projects: projects.length, issues: issues.length };
  }
  const assigned = await userService.getAssignedIssues(user.userId);
  return { projects: null, issues: assigned.length };
}

/**
 * Page frame used after login: sidebar on the left, header on top and the
 * current page below it. Shares the search text with the page.
 */
export function AppLayout() {
  const user = useCurrentUser();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /** Text typed in the header search bar. */
  const [searchText, setSearchText] = useState('');
  /** Sidebar counters. */
  const statsLoader = useCallback(() => loadStats(user), [user]);
  const { data: stats, reload: refreshStats } = useApi(statsLoader);

  /** One-off success message passed by the previous page (e.g. "Project created"). */
  const flash = readFlash(location.state);
  /** Location key whose flash message the user closed. */
  const [dismissedFlashKey, setDismissedFlashKey] = useState<string | null>(null);

  /** The search bar only makes sense on the dashboards (where issues are listed). */
  const showSearch = location.pathname.endsWith('/dashboard');

  /** Counters for the sidebar, depending on the role. */
  const sidebarStats: SidebarStat[] = user.role === 'productOwner'
    ? [
      { label: 'Projects Created', value: stats?.projects ?? null },
      { label: 'Issues Created', value: stats?.issues ?? null },
    ]
    : [{ label: 'Issues Assigned', value: stats?.issues ?? null }];

  /** Ends the session and returns to the login page. */
  function handleLogout() {
    logout();
    navigate(PATHS.login, { replace: true });
  }

  const outletContext = useMemo<LayoutContextValue>(
    () => ({ searchText: showSearch ? searchText : '', refreshStats }),
    [searchText, showSearch, refreshStats],
  );

  return (
    <div className="app-shell d-flex flex-column flex-md-row">
      <Sidebar user={user} stats={sidebarStats} onLogout={handleLogout} />
      <div className="app-main flex-grow-1 d-flex flex-column min-w-0">
        <Header showSearch={showSearch} searchText={searchText} onSearchChange={setSearchText} />
        <main className="app-content flex-grow-1 p-3 p-md-4">
          {flash && dismissedFlashKey !== location.key && (
            <AlertMessage variant="success" onClose={() => setDismissedFlashKey(location.key)}>
              {flash}
            </AlertMessage>
          )}
          <Outlet context={outletContext} />
        </main>
      </div>
      <NotificationToasts />
    </div>
  );
}
