import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../utils/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  /** When true, also require isAdmin. Non-admins get sent to /dashboard. */
  requireAdmin?: boolean;
}

/**
 * Wraps a route so it requires an authenticated session.
 * Loading state shows a spinner; unauthenticated users go to /login;
 * non-admins trying to access admin-only routes go to /dashboard.
 */
export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ECE5D8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-olive animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
