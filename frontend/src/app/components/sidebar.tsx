import { useState } from 'react';
import { LayoutDashboard, TrendingUp, Wallet, Settings, Sparkles, Menu, X, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/auth-context';

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Wallet, label: 'Portfolio', path: '/portfolio' },
        { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
        { icon: Sparkles, label: 'AI Insights', path: '/ai-insights' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleNavigate = (path: string) => {
        navigate(path);
        setMobileOpen(false);
    };

    const navContent = (
        <>
            <div className="p-6 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#8b5cf6] flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-[#0a0e27]" />
                    </div>
                    <div>
                        <div className="text-sm text-sidebar-foreground opacity-90">
                            Küsürat-AI
                        </div>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.label}
                            onClick={() => handleNavigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-lg shadow-purple-glow'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground cursor-pointer'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-sidebar-border space-y-3">
                <div className="bg-gradient-to-r from-[#8b5cf6]/20 to-[#6366f1]/20 rounded-lg p-4 border border-secondary/30">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-[#00ff88]" />
                        <span className="text-xs text-sidebar-foreground/70">
                            AI Status
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></div>
                        <span className="text-sm text-sidebar-foreground">
                            Active & Monitoring
                        </span>
                    </div>
                </div>

                {user && (
                    <div className="flex items-center gap-3 px-2 py-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00ff88] to-[#8b5cf6] flex items-center justify-center text-xs font-bold text-[#0a0e27]">
                            {user.fullName.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-medium text-sidebar-foreground truncate">{user.fullName}</p>
                            <p className="text-[10px] text-sidebar-foreground/50 truncate">{user.email}</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <>
            {/* ── Mobile hamburger button ─────────────────────── */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-lg"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5 text-foreground" />
            </button>

            {/* ── Mobile overlay + drawer ──────────────────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col"
                        >
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center"
                                aria-label="Close menu"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            {navContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── Desktop sidebar (always visible) ──────────────── */}
            <aside className="hidden md:flex w-64 bg-sidebar border-r border-sidebar-border flex-col">
                {navContent}
            </aside>
        </>
    );
}
