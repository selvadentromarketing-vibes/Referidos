import { ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../utils/auth';
import { DEFAULT_LANG, LANGS, type Lang } from '../i18n/translations';

interface ProtectedRouteProps {
  children: ReactNode;
  /** When true, also require isAdmin. Non-admins get sent to /dashboard. */
  requireAdmin?: boolean;
}

/**
 * Wraps a route so it requires an authenticated session.
 * Loading state shows a spinner; unauthenticated users go to /:lang/login;
 * non-admins trying to access admin-only routes go to /:lang/dashboard.
 *
 * The :lang param is read from the URL so redirects keep the user in the
 * language they were browsing in.
 */
export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const params = useParams<{ lang?: string }>();
  const raw = (params.lang ?? '').toLowerCase();
  const lang: Lang = (LANGS as readonly string[]).includes(raw) ? (raw as Lang) : DEFAULT_LANG;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ECE5D8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-olive animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/${lang}/login`} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={`/${lang}/dashboard`} replace />;
  }

  return <>{children}</>;
}
