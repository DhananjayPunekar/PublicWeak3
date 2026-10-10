import { Link } from 'react-router-dom';

/** Shown for any URL that does not match a route. */
export function NotFoundPage() {
  return (
    <main className="container py-5 text-center">
      <p className="display-4 fw-bold text-primary mb-2">404</p>
      <h1 className="h4">Page not found</h1>
      <p className="text-secondary">The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">
        Go to my dashboard
      </Link>
    </main>
  );
}
