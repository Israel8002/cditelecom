import { Home, ClipboardList, Database, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const items = [
  { to: '/dashboard', label: 'Inicio', icon: Home, testId: 'nav-dashboard' },
  { to: '/historial', label: 'Historial', icon: ClipboardList, testId: 'nav-historial' },
  { to: '/respaldos', label: 'Respaldos', icon: Database, testId: 'nav-respaldos' },
  { to: '/configuracion', label: 'Ajustes', icon: Settings, testId: 'nav-configuracion' },
];

export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[560px] bg-[hsl(var(--card))]
      border-t border-[hsl(var(--border))] flex justify-around items-center h-[72px] px-2 z-40">
      {items.map((it) => {
        const active = location.pathname === it.to;
        const Icon = it.icon;
        return (
          <motion.button
            key={it.to} whileTap={{ scale: 0.95 }} data-testid={it.testId}
            onClick={() => navigate(it.to)}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
          >
            <Icon size={22} className={active ? 'text-primary' : 'text-[hsl(var(--muted-foreground))]'} />
            <span className={`text-[11px] ${active ? 'text-primary font-semibold' : 'text-[hsl(var(--muted-foreground))]'}`}>
              {it.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
