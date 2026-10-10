import type { ReactNode } from 'react';
import { BsKanban } from 'react-icons/bs';

/** Props of {@link AuthLayout}. */
interface AuthLayoutProps {
  /** Card title, e.g. "Login". */
  title: string;
  /** Short text under the title. */
  subtitle: string;
  /** The form. */
  children: ReactNode;
}

/** Centered card with the application name, used by the Login and Signup pages. */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="auth-page d-flex align-items-center justify-content-center px-3 py-5">
      <div className="card auth-card shadow-lg border-0 w-100">
        <div className="auth-card-banner text-white text-center py-3 rounded-top">
          <BsKanban className="me-2 mb-1" aria-hidden="true" />
          <span className="fw-bold">Issue Tracking System</span>
        </div>
        <div className="card-body p-4 p-md-5">
          <h1 className="h4 fw-bold mb-1 text-center">{title}</h1>
          <p className="text-secondary text-center small mb-4">{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  );
}
