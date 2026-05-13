import { Shield, Key, Smartphone, CheckCircle2, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useAuth } from '../../lib/auth-context';

export function SecurityCard() {
  const { user, updateProfile, changePassword } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!user) return null;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    try {
      await changePassword(oldPassword, newPassword);
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setIsChangingPassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setMessage({ type: 'error', text: 'Failed to update password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAToggle = () => {
    setIsSettingUp2FA(true);
  };

  const sendCode = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/v1/auth/send-2fa-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to send code');
      setMessage({ type: 'success', text: 'Verification code sent to your email!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to send email. Please check your SMTP settings.' });
    } finally {
      setIsLoading(false);
    }
  };

  const confirm2FA = async (code: string) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/v1/auth/verify-2fa-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Invalid code');
      }

      updateProfile({ is2FAEnabled: !user.is2FAEnabled });
      setMessage({ type: 'success', text: '2FA successfully enabled!' });
      setIsSettingUp2FA(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Account Security</h2>
          <p className="text-xs text-muted-foreground">Manage your authentication and security layers</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Password Section */}
        <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Account Password</p>
                <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
              </div>
            </div>
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="text-xs font-medium text-[#00ff88] hover:underline"
            >
              {isChangingPassword ? 'Cancel' : 'Update Password'}
            </button>
          </div>

          <AnimatePresence>
            {isChangingPassword && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4 space-y-3"
                onSubmit={handlePasswordChange}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50"
                    required
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#00ff88] text-[#0a0e27] px-4 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Change'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* 2FA Section */}
        <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication (Email)</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${user.is2FAEnabled ? 'bg-[#00ff88]' : 'bg-red-500'}`} />
                  <p className="text-xs text-muted-foreground">
                    {user.is2FAEnabled ? 'Protected via ' + user.email : 'Not enabled (Risk: High)'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handle2FAToggle}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                user.is2FAEnabled 
                  ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                  : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
              }`}
            >
              {user.is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>

          <AnimatePresence>
            {isSettingUp2FA && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-6 pt-6 border-t border-border/30"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold">Email Verification</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We will send a 6-digit security code to <span className="text-foreground font-medium">{user.email}</span> to verify your identity.
                      </p>
                    </div>
                    <button
                      onClick={sendCode}
                      disabled={isLoading}
                      className="px-3 py-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 text-secondary text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Send Code'}
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Enter Verification Code</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="000 000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm w-full tracking-[0.5em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50"
                        maxLength={6}
                      />
                      <button
                        onClick={() => confirm2FA(verificationCode)}
                        disabled={isLoading || verificationCode.length !== 6}
                        className="bg-secondary text-white px-6 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-3 rounded-lg flex items-center gap-2 text-xs ${
            message.type === 'success' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-red-500/10 text-red-500'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {message.text}
        </motion.div>
      )}

      <div className="mt-8 pt-6 border-t border-border/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>Login History</p>
          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
            View active sessions <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
