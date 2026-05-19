import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { changePassword } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useTranslation } from 'react-i18next';

export function SecuritySettings() {
    const { user, setTwoFactorEnabled } = useAuth();
    const { t, i18n } = useTranslation();
    const isTurkish = i18n.language.startsWith('tr');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [is2FALoading, setIs2FALoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ 
                type: 'error', 
                text: isTurkish ? 'Yeni şifreler eşleşmiyor.' : 'New passwords do not match.' 
            });
            return;
        }
        
        setIsLoading(true);
        setMessage(null);
        
        try {
            await changePassword(currentPassword, newPassword);
            setMessage({ 
                type: 'success', 
                text: isTurkish ? 'Şifreniz başarıyla güncellendi!' : 'Password updated successfully!' 
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setMessage({ 
                type: 'error', 
                text: err.message || (isTurkish ? 'Şifre güncellenemedi.' : 'Failed to update password.') 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handle2FAToggle = async () => {
        if (!user) return;
        setIs2FALoading(true);
        setMessage(null);
        try {
            await setTwoFactorEnabled(!user.is2FAEnabled);
            setMessage({
                type: 'success',
                text: isTurkish 
                    ? `İki aşamalı doğrulama başarıyla ${user.is2FAEnabled ? 'devre dışı bırakıldı' : 'etkinleştirildi'}.`
                    : `Two-factor authentication ${user.is2FAEnabled ? 'disabled' : 'enabled'} successfully.`,
            });
        } catch (err: any) {
            setMessage({ 
                type: 'error', 
                text: err.message || (isTurkish ? '2FA güncellenemedi.' : 'Failed to update 2FA.') 
            });
        } finally {
            setIs2FALoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-[#00ff88]" />
                <h2 className="text-xl font-semibold text-foreground">{isTurkish ? 'Güvenlik & Şifre' : 'Security & Password'}</h2>
            </div>

            <div className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#8b5cf6]/5 to-[#00ff88]/5 rounded-full blur-3xl"></div>
                
                <form onSubmit={handleSubmit} className="max-w-md space-y-5 relative z-10 text-left">
                    <AnimatePresence mode="wait">
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                                    message.type === 'success' 
                                    ? 'bg-green-500/10 border border-green-500/20 text-green-500' 
                                    : 'bg-red-500/10 border border-red-500/20 text-red-500'
                                }`}
                            >
                                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div>
                        <label className="block text-sm font-medium mb-2">{isTurkish ? 'Mevcut Şifre' : 'Current Password'}</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50 transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        <div>
                            <label className="block text-sm font-medium mb-2">{isTurkish ? 'Yeni Şifre' : 'New Password'}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50 transition-all"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">{isTurkish ? 'Yeni Şifreyi Onayla' : 'Confirm New Password'}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50 transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-[#00ff88] to-[#14b8a6] hover:from-[#00ff88]/90 hover:to-[#14b8a6]/90 text-[#0a0e27] px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-[#00ff88]/20"
                    >
                        {isLoading ? (isTurkish ? 'Güncelleniyor...' : 'Updating...') : (isTurkish ? 'Şifreyi Güncelle' : 'Update Password')}
                    </button>
                </form>
            </div>

            <div className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm text-left">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-sm font-medium">{isTurkish ? 'İki Aşamalı Doğrulama (2FA)' : 'Two-Factor Authentication'}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            {user?.is2FAEnabled
                                ? (isTurkish ? 'Bu hesap için ekstra giriş koruması etkinleştirildi.' : 'Extra sign-in protection is enabled for this account.')
                                : (isTurkish ? 'Hassas işlemler için ek bir doğrulama adımı etkinleştirin.' : 'Enable an additional verification step for sensitive actions.')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handle2FAToggle}
                        disabled={is2FALoading || !user}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
                            user?.is2FAEnabled
                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30'
                                : 'bg-[#00ff88] hover:bg-[#00ff88]/90 text-[#0a0e27]'
                        }`}
                    >
                        {is2FALoading
                            ? (isTurkish ? 'Güncelleniyor...' : 'Updating...')
                            : user?.is2FAEnabled
                                ? (isTurkish ? '2FA Devre Dışı Bırak' : 'Disable 2FA')
                                : (isTurkish ? '2FA Etkinleştir' : 'Enable 2FA')}
                    </button>
                </div>
            </div>
        </div>
    );
}
