import { Brain, CheckCircle2, ArrowDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface ReasoningStep {
  step: number;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
}

interface ReasoningLogProps {
  steps: ReasoningStep[];
}

export function ReasoningLog({ steps }: ReasoningLogProps) {
  const { t, i18n } = useTranslation();
  const isTurkish = i18n.language.startsWith('tr');

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          color: '#00ff88',
          bg: 'bg-[#00ff88]/10',
          border: 'border-[#00ff88]/30',
        };
      case 'active':
        return {
          icon: Brain,
          color: '#8b5cf6',
          bg: 'bg-[#8b5cf6]/10',
          border: 'border-[#8b5cf6]/30',
        };
      default:
        return {
          icon: CheckCircle2,
          color: '#94a3b8',
          bg: 'bg-muted/30',
          border: 'border-border',
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8b5cf6]/20 to-[#6366f1]/20 flex items-center justify-center">
          <Brain className="w-5 h-5 text-[#8b5cf6]" />
        </div>
        <div>
          <h2 className="text-lg">{isTurkish ? 'AI Karar Aşamaları & Mantığı' : 'Recent AI Decisions & Logic'}</h2>
          <p className="text-xs text-muted-foreground">
            {isTurkish ? 'Şeffaf gerekçe zinciri' : 'Transparent reasoning chain'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const config = getStatusConfig(step.status);
          const Icon = config.icon;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.step}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`relative rounded-xl p-4 border ${config.border} ${config.bg}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${config.color}30, ${config.color}20)`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {isTurkish ? `${step.step}. Aşama` : `Step ${step.step}`}
                      </span>
                      {step.status === 'active' && (
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="w-2 h-2 rounded-full bg-[#8b5cf6]"
                        ></motion.div>
                      )}
                    </div>
                    <h3 className="text-sm mb-2">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>

              {!isLast && (
                <div className="flex justify-center py-2">
                  <ArrowDown className="w-5 h-5 text-secondary/50" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-gradient-to-r from-[#8b5cf6]/10 to-[#6366f1]/10 rounded-lg p-4 border border-[#8b5cf6]/30">
        <div className="flex items-start gap-2">
          <Brain className="w-4 h-4 text-[#8b5cf6] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            {isTurkish 
              ? 'Tüm AI kararları şeffaf ve denetlenebilir bir gerekçe zincirini takip eder. Her adım kaydedilir ve geriye dönük incelenebilir.'
              : 'All AI decisions follow a transparent, auditable reasoning chain. Every step is logged and can be reviewed.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
