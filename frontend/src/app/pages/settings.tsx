import { useState } from 'react';
import { AIAutonomyCard } from '../components/settings/ai-autonomy-card';
import { BankIntegrationCard } from '../components/settings/bank-integration-card';
import { NotificationsCard } from '../components/settings/notifications-card';
import { ProfileCard } from '../components/settings/profile-card';

export function Settings() {
  const [fullAutonomous, setFullAutonomous] = useState(false);
  const [riskTolerance, setRiskTolerance] = useState(50);
  const [notifications, setNotifications] = useState({
    investmentAlerts: true,
    weeklySummaries: true,
    marketWarnings: true,
  });

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl tracking-tight bg-gradient-to-r from-[#00ff88] to-[#8b5cf6] bg-clip-text text-transparent">
              Settings & Account
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile and autonomous agent behavior
            </p>
          </div>
        </div>

        <ProfileCard />

        <div className="grid grid-cols-1 gap-6">
          <AIAutonomyCard
            fullAutonomous={fullAutonomous}
            setFullAutonomous={setFullAutonomous}
            riskTolerance={riskTolerance}
            setRiskTolerance={setRiskTolerance}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BankIntegrationCard />
            <NotificationsCard
              notifications={notifications}
              setNotifications={setNotifications}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
