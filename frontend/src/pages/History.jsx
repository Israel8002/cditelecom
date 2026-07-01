import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchBox from '../components/SearchBox';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import BottomNavigation from '../components/BottomNavigation';
import { getAllEvaluations } from '../services/storage.service';
import { getUnitById, getRoomById } from '../services/catalog.service';
import { useUserStore } from '../stores/user.store';
import { useEvaluationStore } from '../stores/evaluation.store';
import { ESTADO } from '../catalogs/constants';

export default function History() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const loadUser = useUserStore((s) => s.load);
  const loadInto = useEvaluationStore((s) => s.loadInto);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    getAllEvaluations().then((all) => setItems(all.filter((e) => e.estado !== 'borrador')));
    if (!user) loadUser();
  }, [user, loadUser]);

  const unitName = (u) => getUnitById(u)?.nombre || String(u);
  const roomName = (r) => getRoomById(r)?.nombre || String(r);
  const filtered = items.filter((e) => {
    const t = `${e.id} ${unitName(e.unidad)} ${roomName(e.cuarto)}`.toLowerCase();
    return t.includes(q.toLowerCase());
  });

  return (
    <div className="app-shell">
      <PageHeader title="Historial" subtitle={`${items.length} evaluaciones`} onBack={() => navigate('/dashboard')} />
      <div className="px-6 mb-4"><SearchBox value={q} onChange={setQ} placeholder="Buscar evaluación..." testId="search-history" /></div>
      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Sin evaluaciones" description="Las evaluaciones que realices aparecerán aquí." testId="history-empty" />
      ) : (
        <div className="px-6 flex flex-col gap-3">
          {filtered.map((e) => (
            <Card key={e.id} onClick={() => { loadInto(e); navigate(`/detalle/${e.id}`); }} testId={`history-${e.id}`} padding="p-4">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{e.id}</p>
              <p className="font-semibold mt-1" style={{ fontWeight: 600 }}>{unitName(e.unidad)}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{roomName(e.cuarto)} · {e.fecha} {e.hora}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{user?.nombre}</p>
              <span className={`inline-block mt-2 text-xs px-3 py-1.5 rounded-full
                ${e.estado === ESTADO.RESPALDADO ? 'bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]' : 'bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))]'}`}>
                {e.estado === ESTADO.RESPALDADO ? 'Respaldado' : 'Pendiente de respaldo'}
              </span>
            </Card>
          ))}
        </div>
      )}
      <BottomNavigation />
    </div>
  );
}
