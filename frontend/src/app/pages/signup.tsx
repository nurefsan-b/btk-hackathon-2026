import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../lib/auth-context';

export function SignUp() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [riskProfile, setRiskProfile] = useState<'low' | 'medium' | 'high'>('medium');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signup(fullName, email, password, riskProfile);
      navigate('/dashboard');
    } catch {
      setError('Could not create this account. Try another email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: 'Automated Round-ups',
      description: 'Invest your spare change effortlessly',
      color: '#00ff88',
    },
    {
      icon: TrendingUp,
      title: 'AI Market Sentiment',
      description: 'Gemini-powered news analysis',
      color: '#8b5cf6',
    },
    {
      icon: ShieldCheck,
      title: 'Bank-level Security',
      description: 'Your data is encrypted and secure',
      color: '#6366f1',
    },
  ];

  return (
    <div className="size-full flex flex-col lg:flex-row bg-background dark overflow-hidden min-h-screen">
      {/* Left Side - Value Proposition Area */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-8 lg:p-12 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 via-[#6366f1]/10 to-[#00ff88]/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8b5cf6]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00ff88]/20 rounded-full blur-3xl"></div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-lg"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#8b5cf6] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#0a0e27]" />
            </div>
            <div className="text-xl bg-gradient-to-r from-[#00ff88] to-[#8b5cf6] bg-clip-text text-transparent">
              Küsürat-AI
            </div>
          </div>

          <h1 className="text-4xl mb-4 bg-gradient-to-r from-[#00ff88] to-[#8b5cf6] bg-clip-text text-transparent">
            Automate your wealth with AI intelligence
          </h1>
          <p className="text-muted-foreground mb-12">
            Join thousands of users who trust AI to grow their investments through intelligent spare change automation.
          </p>

          {/* Features List */}
          <div className="space-y-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Glassmorphism Card */}
          <div className="relative overflow-hidden rounded-2xl bg-card/50 border border-border backdrop-blur-xl p-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#8b5cf6]/10 to-[#00ff88]/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-2xl mb-2">Start Your AI Investment Journey</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Create an account and let AI manage your wealth
              </p>

              <form onSubmit={handleSignUp} className="space-y-5">
                {error && (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                {/* Full Name Input */}
                <div>
                  <label htmlFor="fullName" className="block text-sm mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-input-background border border-border rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50 focus:border-[#00ff88] transition-all"
                      required
                    />
                  </div>
                </div>

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
                      placeholder="Create a strong password"
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

                {/* Initial Risk Profile */}
                <div>
                  <label className="block text-sm mb-3">
                    Initial Risk Profile
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setRiskProfile(level)}
                        className={`px-4 py-3 rounded-lg border transition-all ${riskProfile === level
                            ? 'bg-[#00ff88]/10 border-[#00ff88] text-[#00ff88]'
                            : 'bg-muted/20 border-border text-muted-foreground hover:bg-muted/30'
                          }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {riskProfile === 'low' && 'Conservative approach with stable, low-risk investments'}
                    {riskProfile === 'medium' && 'Balanced portfolio with moderate growth potential'}
                    {riskProfile === 'high' && 'Aggressive strategy targeting high-growth opportunities'}
                  </p>
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#00ff88] to-[#14b8a6] hover:from-[#00ff88]/90 hover:to-[#14b8a6]/90 text-[#0a0e27] px-6 py-3 rounded-lg transition-all duration-200 shadow-lg shadow-[#00ff88]/20 hover:shadow-xl hover:shadow-[#00ff88]/30"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
                  <span>Sign up with Google</span>
                </button>

                {/* Terms */}
                <p className="text-xs text-center text-muted-foreground">
                  By creating an account, you agree to our{' '}
                  <button className="text-[#00ff88] hover:text-[#00ff88]/80">Terms of Service</button>
                </p>
              </form>

              {/* Login Link */}
              <p className="text-sm text-center text-muted-foreground mt-6">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-[#00ff88] hover:text-[#00ff88]/80 transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
