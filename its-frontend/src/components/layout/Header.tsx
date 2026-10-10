import { BsSearch } from 'react-icons/bs';

/** Props of {@link Header}. */
interface HeaderProps {
  /** Show the search bar (dashboards only). */
  showSearch: boolean;
  /** Current search text. */
  searchText: string;
  /** Called on every change of the search text. */
  onSearchChange: (text: string) => void;
}

/** Top bar: search bar on the left, application name on the right. */
export function Header({ showSearch, searchText, onSearchChange }: HeaderProps) {
  return (
    <header className="app-header d-flex align-items-center gap-3 px-3 px-md-4">
      {showSearch ? (
        <div className="input-group app-search" role="search">
          <span className="input-group-text bg-white border-end-0">
            <BsSearch aria-hidden="true" />
          </span>
          <input
            type="search"
            className="form-control border-start-0"
            placeholder="Search issue by summary or description"
            title="Regular expressions are supported, e.g. login|payment"
            aria-label="Search issues by summary or description"
            value={searchText}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      ) : (
        <div className="flex-grow-1" />
      )}
      <span className="app-title ms-auto fw-bold text-nowrap">Issue Tracking System</span>
    </header>
  );
}
