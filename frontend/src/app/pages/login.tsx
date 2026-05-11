import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../lib/auth-context';

export function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login(email, password);
        navigate('/dashboard');
    };

    return (
        <div className="size-full flex bg-background dark overflow-hidden min-h-screen">
            {/* Left Side - Form Area */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#8b5cf6] flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-[#0a0e27]" />
                        </div>
                        <div className="text-xl bg-gradient-to-r from-[#00ff88] to-[#8b5cf6] bg-clip-text text-transparent">
                            Küsürat-AI
                        </div>
                    </div>

                    {/* Glassmorphism Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-card/50 border border-border backdrop-blur-xl p-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#8b5cf6]/10 to-[#00ff88]/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <h1 className="text-2xl mb-2">Welcome back to Küsürat-AI</h1>
                            <p className="text-sm text-muted-foreground mb-8">
                                Your AI agent is actively monitoring the markets
                            </p>

                            <form onSubmit={handleLogin} className="space-y-5">
                                {/* Email Input */}
                                <div>
                                    <label htmlFor="email" className="block text-sm mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full bg-input-background border border-border rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50 focus:border-[#00ff88] transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div>
                                    <label htmlFor="password" className="block text-sm mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full bg-input-background border border-border rounded-lg pl-11 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50 focus:border-[#00ff88] transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 rounded border-border bg-input-background checked:bg-[#00ff88] checked:border-[#00ff88] focus:ring-2 focus:ring-[#00ff88]/50 cursor-pointer"
                                        />
                                        <span className="text-sm text-muted-foreground">Remember me</span>
                                    </label>
                                    <button
                                        type="button"
                                        className="text-sm text-muted-foreground hover:text-[#00ff88] transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                {/* Primary Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-[#00ff88] to-[#14b8a6] hover:from-[#00ff88]/90 hover:to-[#14b8a6]/90 text-[#0a0e27] px-6 py-3 rounded-lg transition-all duration-200 shadow-lg shadow-[#00ff88]/20 hover:shadow-xl hover:shadow-[#00ff88]/30"
                                >
                                    Access AI Dashboard
                                </button>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                                    </div>
                                </div>

                                {/* Google Button */}
                                <button
                                    type="button"
                                    className="w-full bg-transparent border border-border hover:bg-muted/20 px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    <span>Continue with Google</span>
                                </button>
                            </form>

                            {/* Sign Up Link */}
                            <p className="text-sm text-center text-muted-foreground mt-8">
                                Don't have an account?{' '}
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="text-[#00ff88] hover:text-[#00ff88]/80 transition-colors"
                                >
                                    Sign up
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Visual/Branding Area */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/20 via-[#6366f1]/20 to-[#00ff88]/20"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8b5cf6]/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00ff88]/30 rounded-full blur-3xl"></div>

                {/* Neural Network Visualization */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="relative z-10"
                >
                    <div className="relative w-64 h-64">
                        {/* Central Sphere */}
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00ff88] to-[#8b5cf6] opacity-20 blur-2xl"
                        ></motion.div>
                        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#00ff88] to-[#8b5cf6] opacity-40"></div>
                        <div className="absolute inset-16 rounded-full bg-gradient-to-br from-[#00ff88] to-[#8b5cf6]"></div>

                        {/* Orbiting Nodes */}
                        {[0, 120, 240].map((rotation, index) => (
                            <motion.div
                                key={index}
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 10 + index * 2,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                                className="absolute inset-0"
                                style={{ transform: `rotate(${rotation}deg)` }}
                            >
                                <div className="absolute top-0 left-1/2 w-3 h-3 -ml-1.5 rounded-full bg-[#00ff88] shadow-lg shadow-[#00ff88]/50"></div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Floating Status Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80"
                >
                    <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></div>
                                <span className="text-sm text-[#00ff88]">AI Agent Status: Active</span>
                            </div>
                            <div className="text-sm text-muted-foreground">|</div>
                            <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-[#8b5cf6]" />
                                <span className="text-sm text-muted-foreground">1,245 Market Signals Analyzed Today</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
