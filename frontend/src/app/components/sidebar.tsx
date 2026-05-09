import { LayoutDashboard, TrendingUp, Wallet, Settings, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Wallet, label: 'Portfolio', path: '/portfolio' },
        { icon: TrendingUp, label: 'Analytics', path: '#' },
        { icon: Sparkles, label: 'AI Insights', path: '#' },
        { icon: Settings, label: 'Settings', path: '#' },
    ];

    return (
        <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
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
                            onClick={() => item.path !== '#' && navigate(item.path)}
                            disabled={item.path === '#'}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-lg shadow-purple-glow'
                                    : item.path === '#'
                                        ? 'text-sidebar-foreground/30 cursor-not-allowed'
                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground cursor-pointer'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-sidebar-border">
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
            </div>
        </aside>
    );
}
