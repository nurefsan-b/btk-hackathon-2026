import { useState } from 'react';
import { User, Shield, Bell, Brain, CreditCard } from 'lucide-react';
import { AIAutonomyCard } from '../components/settings/ai-autonomy-card';
import { BankIntegrationCard } from '../components/settings/bank-integration-card';
import { NotificationsCard } from '../components/settings/notifications-card';
import { ProfileCard } from '../components/settings/profile-card';
import { SecuritySettings } from '../components/settings/security-settings';
import { motion } from 'motion/react';

export function Settings() {
  const [fullAutonomous, setFullAutonomous] = useState(false);
  const [riskTolerance, setRiskTolerance] = useState(50);
  const [notifications, setNotifications] = useState({
    investmentAlerts: true,
    weeklySummaries: true,
    marketWarnings: true,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 bg-background/50">
      <motion.div 
        className="max-w-4xl mx-auto space-y-12 pb-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#00ff88] to-[#8b5cf6] bg-clip-text text-transparent">
            Account Settings
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your personal profile, security, and AI agent behavior
          </p>
        </motion.div>

        {/* Profile Section */}
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <User className="w-5 h-5 text-[#00ff88]" />
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>
          <ProfileCard />
        </motion.section>

        {/* Security Section */}
        <motion.section variants={itemVariants} className="space-y-4">
          <SecuritySettings />
        </motion.section>

        {/* AI Agent Section */}
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <Brain className="w-5 h-5 text-[#8b5cf6]" />
            <h2 className="text-xl font-semibold">AI Autonomy & Strategy</h2>
          </div>
          <AIAutonomyCard
            fullAutonomous={fullAutonomous}
            setFullAutonomous={setFullAutonomous}
            riskTolerance={riskTolerance}
            setRiskTolerance={setRiskTolerance}
          />
        </motion.section>

        {/* Integrations & Notifications */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">Integrations</h2>
            </div>
            <BankIntegrationCard />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            <NotificationsCard
              notifications={notifications}
              setNotifications={setNotifications}
            />
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
