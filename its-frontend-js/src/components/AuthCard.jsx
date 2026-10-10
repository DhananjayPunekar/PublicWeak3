/**
 * Centered card with the application name, shared by the Login and Signup pages.
 * Props: title (e.g. "Login"), subtitle, children (the form).
 */
function AuthCard({ title, subtitle, children }) {
  return (
    <main className="min-vh-100 d-flex align-items-center justify-content-center bg-dark bg-gradient p-3">
      <div className="card shadow-lg border-0 w-100" style={{ maxWidth: '440px' }}>
        <div className="card-header bg-primary bg-gradient text-white text-center fw-bold py-3">
          Issue Tracking System
        </div>
        <div className="card-body p-4">
          <h1 className="h4 text-center fw-bold text-body mb-1">{title}</h1>
          <p className="text-center text-secondary small mb-4">{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  );
}

export default AuthCard;
