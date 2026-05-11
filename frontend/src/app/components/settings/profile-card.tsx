import { User, LogOut, Mail, Calendar, Shield, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useAuth } from '../../lib/auth-context';

export function ProfileCard() {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');

  if (!user) return null;

  const handleSave = () => {
    updateProfile({ fullName, email });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFullName(user.fullName);
    setEmail(user.email);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00ff88] to-[#8b5cf6] flex items-center justify-center text-3xl font-bold text-[#0a0e27]">
              {user.fullName.charAt(0)}
            </div>
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-lg font-semibold w-full focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50"
                      placeholder="Full Name"
                    />
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-muted/50 border border-border rounded-lg px-3 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50"
                        placeholder="Email"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <h2 className="text-2xl font-semibold mb-1 flex items-center gap-3">
                      {user.fullName}
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00ff88] text-[#0a0e27] transition-all hover:scale-105 active:scale-95 text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-all text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 transition-all hover:scale-105 active:scale-95"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-[#00ff88]" />
              <h3 className="text-sm font-medium">Risk Profile</h3>
            </div>
            <p className="text-lg text-foreground capitalize">{user.riskProfile}</p>
            <p className="text-xs text-muted-foreground mt-1">Based on your initial configuration</p>
          </div>
          <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-secondary" />
              <h3 className="text-sm font-medium">Account Security</h3>
            </div>
            <p className="text-lg text-foreground">Verified</p>
            <p className="text-xs text-muted-foreground mt-1">Your account is secured with 2FA</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
