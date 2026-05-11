import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConnectionBannerProps {
    isOnline: boolean | null;
}

export function ConnectionBanner({ isOnline }: ConnectionBannerProps) {
    if (isOnline === null || isOnline === true) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 p-4 flex items-center gap-3"
            >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <WifiOff className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-amber-200 font-medium">
                        Backend bağlantısı kurulamadı
                    </p>
                    <p className="text-xs text-amber-200/70 mt-0.5">
                        Demo veriler gösteriliyor. Gerçek veriler için <code className="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">make up</code> ile backend'i başlatın.
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
