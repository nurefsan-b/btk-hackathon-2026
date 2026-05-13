import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_client: 'Google client secret bu client id ile eslesmiyor.',
  invalid_grant: 'Google oturum kodu gecersiz veya suresi doldu.',
  redirect_uri_mismatch: 'Google redirect URI ayari frontend/backend ile eslesmiyor.',
  missing_code: 'Google oturum kodu donmedi.',
  google_auth_failed: 'Google sign-in could not be completed.',
  google_oauth_error: 'Google OAuth request failed.',
};

export function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { completeTokenLogin, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get('token');
    const oauthError = params.get('error');
    if (oauthError) {
      setError(OAUTH_ERROR_MESSAGES[oauthError] ?? `Google sign-in failed: ${oauthError}`);
      return;
    }
    if (!token) {
      setError('Missing authentication token.');
      return;
    }

    completeTokenLogin(token)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => setError('Session could not be created.'));
  }, [completeTokenLogin, navigate, params]);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="size-full min-h-screen bg-background dark flex items-center justify-center p-8">
      <div className="rounded-2xl bg-card border border-border p-8 w-full max-w-md text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#00ff88] to-[#8b5cf6] flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-[#0a0e27]" />
        </div>
        <h1 className="text-xl mb-2">{error ? 'Sign-in failed' : 'Completing sign-in'}</h1>
        <p className="text-sm text-muted-foreground">
          {error ?? 'Your Google account is being connected to MicroFon.'}
        </p>
      </div>
    </div>
  );
}
