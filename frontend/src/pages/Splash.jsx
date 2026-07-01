import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import { appConfig } from '../catalogs/appConfig';
import { useUserStore } from '../stores/user.store';
import { logEvent, LOG } from '../services/log.service';

export default function Splash() {
  const navigate = useNavigate();
  const load = useUserStore((s) => s.load);

  useEffect(() => {
    let active = true;
    const run = async () => {
      const user = await load();
      logEvent(LOG.INICIO);
      setTimeout(() => {
        if (!active) return;
        navigate(user ? '/dashboard' : '/registro', { replace: true });
      }, appConfig.splashDurationMs);
    };
    run();
    return () => { active = false; };
  }, [load, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}
        className="h-24 w-24 rounded-[28px] bg-primary flex items-center justify-center mb-8"
      >
        <Network size={48} className="text-primary-foreground" />
      </motion.div>
      <motion.h1
        initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.4 }}
        className="text-xl font-bold leading-snug max-w-xs" style={{ fontWeight: 700 }}
      >
        Sistema de Evaluación de Cuartos de Telecomunicaciones
      </motion.h1>
      <p className="text-[hsl(var(--muted-foreground))] mt-2 text-sm">{appConfig.institution}</p>

      <div className="mt-10 h-1.5 w-48 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: '0%' }} animate={{ width: '100%' }}
          transition={{ duration: appConfig.splashDurationMs / 1000, ease: 'easeInOut' }}
        />
      </div>
      <p className="text-[hsl(var(--muted-foreground))] mt-6 text-xs">Versión {appConfig.version}</p>
    </div>
  );
}
