import { Building2, CheckCircle2, Plus, CreditCard, ArrowDownToLine, Wallet, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { toast } from 'sonner';

export function BankIntegrationCard() {
  const { t, i18n } = useTranslation();
  const isTurkish = i18n.language.startsWith('tr');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [hasAddedNew, setHasAddedNew] = useState(false);

  const handleAddAccount = () => {
    toast.success(isTurkish ? 'Hesap başarıyla bağlandı!' : 'Account linked successfully!');
    setHasAddedNew(true);
  };

  const handleWithdraw = () => {
    setIsWithdrawing(true);
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: isTurkish ? 'Para çekme işlemi başlatılıyor...' : 'Initiating withdrawal...',
        success: () => {
          setIsWithdrawing(false);
          return isTurkish ? '₺1.450,00 hesabınıza aktarıldı!' : '₺1,450.00 withdrawn to your account!';
        },
        error: isTurkish ? 'İşlem başarısız oldu' : 'Withdrawal failed',
      }
    );
  };

  const integrations = [
    {
      id: '1',
      name: isTurkish ? 'Simüle Banka API\'si' : 'Mock Bank API',
      status: 'connected',
      type: isTurkish ? 'Webhook Entegrasyonu' : 'Webhook Integration',
      lastSync: isTurkish ? '2 dakika önce' : '2 minutes ago',
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00ff88]/20 to-[#14b8a6]/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-[#00ff88]" />
        </div>
        <div className="text-left flex-1">
          <h2 className="text-lg">{isTurkish ? 'Hesaplarım & Kartlar' : 'Accounts & Cards'}</h2>
          <p className="text-xs text-muted-foreground">{isTurkish ? 'Para çekme ve yatırma kanalları' : 'Deposit & withdrawal channels'}</p>
        </div>
        <button 
          onClick={handleAddAccount}
          className="flex items-center gap-2 px-3 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">{isTurkish ? 'Yeni Ekle' : 'Add New'}</span>
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <motion.div className="bg-muted/20 rounded-xl p-4 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm mb-1">TR45 **** **** 1234</h3>
                <p className="text-xs text-muted-foreground">{isTurkish ? 'Garanti BBVA - Maaş Hesabı' : 'Salary Account'}</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-2">
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 rounded-lg transition-colors text-[#00ff88] disabled:opacity-50"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span className="text-xs">{isTurkish ? 'Para Çek' : 'Withdraw'}</span>
              </button>
              <button 
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                onClick={() => toast.success(isTurkish ? 'Hesap silindi.' : 'Account removed.')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {hasAddedNew && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-muted/20 rounded-xl p-4 border border-border/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-sm mb-1">5432 **** **** 9876</h3>
                  <p className="text-xs text-muted-foreground">{isTurkish ? 'Kredi Kartı (Küsürat Çekimi)' : 'Credit Card (Round-ups)'}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-[#00ff88]/10 rounded-lg border border-[#00ff88]/30">
                  <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></div>
                  <span className="text-xs text-[#00ff88]">{isTurkish ? 'Aktif' : 'Active'}</span>
                </div>
                <button 
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  onClick={() => {
                    setHasAddedNew(false);
                    toast.success(isTurkish ? 'Kart silindi.' : 'Card removed.');
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-4 bg-gradient-to-r from-[#00ff88]/10 to-[#14b8a6]/10 rounded-lg p-4 border border-[#00ff88]/30 text-left">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#00ff88] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-medium">{isTurkish ? 'Güvenli Altyapı' : 'Secure Infrastructure'}</p>
            <p className="text-xs text-muted-foreground">
              {isTurkish 
                ? 'Tüm IBAN ve kart bilgileriniz uçtan uca şifreleme ve PCI-DSS standartları ile korunmaktadır. Paranızı istediğiniz an 7/24 çekebilirsiniz.'
                : 'All credentials use end-to-end encryption. You can withdraw your funds 24/7 instantly.'
              }
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
