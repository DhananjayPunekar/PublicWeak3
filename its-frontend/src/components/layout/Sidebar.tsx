import { NavLink } from 'react-router-dom';
import { BsBoxArrowRight, BsKanban, BsPlusSquare, BsBug } from 'react-icons/bs';
import { Avatar } from '../common/Avatar';
import { PATHS } from '../../routes/paths';
import type { User } from '../../models/user';

/** A counter shown under the profile, e.g. "3 Projects Created". */
export interface SidebarStat {
  label: string;
  /** null while loading. */
  value: number | null;
}

/** Props of {@link Sidebar}. */
interface SidebarProps {
  user: User;
  stats: readonly SidebarStat[];
  onLogout: () => void;
}

/** Navigation links of the Project Owner (assignees have a single page). */
const OWNER_LINKS = [
  { to: PATHS.ownerDashboard, label: 'Project Dashboard', icon: BsKanban },
  { to: PATHS.createProject, label: 'Create Project', icon: BsPlusSquare },
  { to: PATHS.createIssue, label: 'Create Issue', icon: BsBug },
] as const;

/** Left sidebar: profile, counters, navigation and logout. */
export function Sidebar({ user, stats, onLogout }: SidebarProps) {
  return (
    <aside className="app-sidebar d-flex flex-column text-center p-3" aria-label="Sidebar">
      <div className="pt-2 pb-3">
        <Avatar name={user.name} src={user.profileImage} size={84} className="sidebar-avatar mb-2" />
        <div className="fw-semibold text-white text-break">{user.name}</div>
        <div className="small sidebar-email text-break">{user.email}</div>
      </div>

      <div className="d-flex justify-content-center gap-2 mb-3">
        {stats.map((stat) => (
          <div key={stat.label} className="sidebar-stat flex-fill rounded-3 py-2 px-1">
            <div className="fs-4 fw-bold text-white" data-testid={`stat-${stat.label}`}>
              {stat.value ?? '–'}
            </div>
            <div className="small">{stat.label}</div>
          </div>
        ))}
      </div>

      {user.role === 'productOwner' && (
        <nav className="nav flex-column text-start gap-1 mb-3">
          {OWNER_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `nav-link sidebar-link rounded-2 ${isActive ? 'active' : ''}`}>
              <Icon className="me-2" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      )}

      <button type="button" className="btn btn-outline-light btn-sm mt-auto sidebar-logout" onClick={onLogout}>
        <BsBoxArrowRight className="me-2" aria-hidden="true" />
        Logout
      </button>
    </aside>
  );
}
