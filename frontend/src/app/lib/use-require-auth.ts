import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth, type User } from './auth-context';

/**
 * useRequireAuth — Auth guard hook for protected page components.
 *
 * Problem it solves:
 *   `const userId = user?.id || 'user_demo'` was used across all protected
 *   pages as a cheap fallback. If the JWT expires mid-session (auth-context
 *   clears `user` to null), the page would silently switch to the demo account
 *   instead of redirecting the user to login.
 *
 * How to use:
 *   Replace `const { user } = useAuth()` + `user?.id ?? 'user_demo'`
 *   with `const user = useRequireAuth()`.
 *
 *   `user` is guaranteed to be non-null at render time — TypeScript knows this.
 *   If the user is not authenticated, they are redirected to /login immediately.
 *
 * @returns The authenticated User object (never null).
 *
 * @example
 * export function Dashboard() {
 *   const user = useRequireAuth();          // ← guaranteed non-null
 *   const userId = user.id;                // ← no optional chaining needed
 *   ...
 * }
 */
export function useRequireAuth(): User {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // TypeScript guard — at render time user may briefly be null while the
  // useEffect redirect is queued. Throwing here prevents the page from
  // rendering stale data with a null user.
  if (!user) {
    // This state is transient; the useEffect above will redirect on next tick.
    // We throw a special marker so React's error boundary can catch it if needed,
    // but in practice the redirect fires before the boundary triggers.
    throw new Promise(() => {}); // Suspense-compatible — page stays blank briefly
  }

  return user;
}
