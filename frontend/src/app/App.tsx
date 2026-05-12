import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router';
import { AuthProvider, useAuth } from './lib/auth-context';
import { Sidebar } from './components/sidebar';
import { Dashboard } from './pages/dashboard';
import { Portfolio } from './pages/portfolio';
import { Analytics } from './pages/analytics';
import { AIInsights } from './pages/ai-insights';
import { Settings } from './pages/settings';
import { Login } from './pages/login';
import { SignUp } from './pages/signup';

// ── Protected Layout (sidebar + content) ────────────────────
function ProtectedLayout() {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return (
        <div className="size-full flex bg-background dark">
            <Sidebar />
            <Outlet />
        </div>
    );
}

// ── Guest-only wrapper (redirect to dashboard if logged in) ─
function GuestRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* ── Public auth routes ──────────────── */}
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <Login />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            <GuestRoute>
                                <SignUp />
                            </GuestRoute>
                        }
                    />
                    {/* ── Protected app routes ───────────── */}
                    <Route element={<ProtectedLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/portfolio" element={<Portfolio />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/ai-insights" element={<AIInsights />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>

                    {/* ── Catch-all redirect ──────────────── */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
