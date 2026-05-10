import { Bell, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import * as Switch from '@radix-ui/react-switch';

interface NotificationsCardProps {
  notifications: {
    investmentAlerts: boolean;
    weeklySummaries: boolean;
    marketWarnings: boolean;
  };
  setNotifications: (notifications: any) => void;
}

export function NotificationsCard({ notifications, setNotifications }: NotificationsCardProps) {
  const notificationSettings = [
    {
      id: 'investmentAlerts',
      icon: TrendingUp,
      title: 'Investment Alerts',
      description: 'Get notified when AI makes investment decisions',
      color: '#00ff88',
    },
    {
      id: 'weeklySummaries',
      icon: Calendar,
      title: 'Weekly Summaries',
      description: 'Receive weekly portfolio performance reports',
      color: '#8b5cf6',
    },
    {
      id: 'marketWarnings',
      icon: AlertTriangle,
      title: 'AI Market Warnings',
      description: 'Critical alerts about market volatility and risks',
      color: '#f59e0b',
    },
  ];

  const handleToggle = (id: string) => {
    setNotifications({
      ...notifications,
      [id]: !notifications[id as keyof typeof notifications],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20 flex items-center justify-center">
          <Bell className="w-5 h-5 text-[#6366f1]" />
        </div>
        <div>
          <h2 className="text-lg">Notifications</h2>
          <p className="text-xs text-muted-foreground">Manage your alert preferences</p>
        </div>
      </div>

      <div className="space-y-3">
        {notificationSettings.map((setting, index) => {
          const Icon = setting.icon;
          const isEnabled = notifications[setting.id as keyof typeof notifications];

          return (
            <motion.div
              key={setting.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="bg-muted/20 rounded-xl p-4 border border-border/50 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${setting.color}20, ${setting.color}10)`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: setting.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm mb-1">{setting.title}</h3>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <Switch.Root
                  checked={isEnabled}
                  onCheckedChange={() => handleToggle(setting.id)}
                  className="w-12 h-6 bg-muted rounded-full relative data-[state=checked]:bg-[#00ff88] transition-colors"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[26px] shadow-lg" />
                </Switch.Root>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 bg-gradient-to-r from-muted/30 to-muted/20 rounded-lg p-4 border border-border/50">
        <p className="text-xs text-muted-foreground">
          Notifications are delivered via in-app alerts and email. You can customize delivery methods in advanced settings.
        </p>
      </div>
    </motion.div>
  );
}
