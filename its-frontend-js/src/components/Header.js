/**
 * Top bar: search bar on the left (only when onSearchChange is given)
 * and the application name on the right.
 * Props: searchText, onSearchChange(text)
 */
function Header({ searchText, onSearchChange }) {
  return (
    <header className="d-flex align-items-center gap-3 bg-white border-bottom border-3 border-primary shadow-sm px-3 py-3">
      {onSearchChange ? (
        <input
          type="search"
          className="form-control w-50"
          placeholder="Search issue by summary or description"
          title="Regular expressions are supported, e.g. login|payment"
          value={searchText}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      ) : (
        <div className="flex-grow-1"></div>
      )}
      <span className="ms-auto fw-bold text-primary text-nowrap">Issue Tracking System</span>
    </header>
  );
}

export default Header;
