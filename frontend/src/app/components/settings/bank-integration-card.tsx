import { Building2, CheckCircle2, Link2 } from 'lucide-react';
import { motion } from 'motion/react';

export function BankIntegrationCard() {
  const integrations = [
    {
      id: '1',
      name: 'Mock Bank API',
      status: 'connected',
      type: 'Webhook Integration',
      lastSync: '2 minutes ago',
    },
    {
      id: '2',
      name: 'Payment Gateway',
      status: 'connected',
      type: 'Direct Integration',
      lastSync: '5 minutes ago',
    },
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
        <div>
          <h2 className="text-lg">Bank Integrations & Webhooks</h2>
          <p className="text-xs text-muted-foreground">Connected financial services</p>
        </div>
      </div>

      <div className="space-y-3">
        {integrations.map((integration, index) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="bg-muted/20 rounded-xl p-4 border border-border/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-sm mb-1">{integration.name}</h3>
                  <p className="text-xs text-muted-foreground">{integration.type}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 px-3 py-1 bg-[#00ff88]/10 rounded-lg border border-[#00ff88]/30 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></div>
                  <span className="text-xs text-[#00ff88]">Connected</span>
                </div>
                <p className="text-xs text-muted-foreground">Last sync: {integration.lastSync}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 bg-gradient-to-r from-[#00ff88]/10 to-[#14b8a6]/10 rounded-lg p-4 border border-[#00ff88]/30">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#00ff88] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Secure Connection</p>
            <p className="text-xs text-muted-foreground">
              All connections use end-to-end encryption and OAuth 2.0 authentication. No credentials are stored.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
