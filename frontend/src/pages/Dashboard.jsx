import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ClipboardList, Database, Settings, AlertCircle, Trash2, Package } from 'lucide-react';
import Card from '../components/Card';
import StatsCard from '../components/StatsCard';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import { useUserStore } from '../stores/user.store';
import { useEvaluationStore } from '../stores/evaluation.store';
import { getAllEvaluations, getAllBackups, getConfig, setConfig, getDraft, deleteEvaluationCascade, countEquipos } from '../services/storage.service';
import { getCityName, getUnitById, getRoomById } from '../services/catalog.service';
import { formatDate, formatTime, formatDateLong } from '../services/format';
import { appConfig } from '../catalogs/appConfig';
import { ESTADO } from '../catalogs/constants';
import { logEvent, LOG } from '../services/log.service';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const loadUser = useUserStore((s) => s.load);
  const startEval = useEvaluationStore((s) => s.start);
  const loadInto = useEvaluationStore((s) => s.loadInto);
  const [stats, setStats] = useState({ realizadas: 0, respaldos: 0, pendientes: 0, ultima: null, equipos: 0 });
  const [recent, setRecent] = useState([]);
  const [draft, setDraft] = useState(null);
  const [confirmDraft, setConfirmDraft] = useState(false);
  const [now] = useState(new Date());

  // Annual cleanup states
  const [showCleanupPrompt, setShowCleanupPrompt] = useState(false);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);
  const [cleanupYear, setCleanupYear] = useState(null);

  const checkAnnualCleanup = async (evalsList) => {
    const currentYear = new Date().getFullYear();
    const lastChecked = await getConfig('ultimoAnioVerificado');
    
    if (lastChecked === undefined || lastChecked === null) {
      // First time initialization, just record current year without prompting
      await setConfig('ultimoAnioVerificado', currentYear);
      return;
    }
    
    if (currentYear > Number(lastChecked)) {
      // Find evaluations from previous years
      const pastEvals = evalsList.filter((e) => {
        if (!e.fecha || !e.fecha.includes('/')) return false;
        const year = Number(e.fecha.split('/')[2]);
        return year < currentYear;
      });
      
      if (pastEvals.length > 0) {
        setCleanupYear(currentYear - 1);
        setShowCleanupPrompt(true);
      } else {
        // No evaluations from past years, just update year
        await setConfig('ultimoAnioVerificado', currentYear);
      }
    }
  };

  const refresh = async () => {
    const evals = await getAllEvaluations();
    const finalized = evals.filter((e) => e.estado !== 'borrador');
    const backups = await getAllBackups();
    const count = await countEquipos();
    setStats({
      realizadas: finalized.length,
      respaldos: backups.length,
      pendientes: finalized.filter((e) => e.estado === ESTADO.PENDIENTE).length,
      ultima: await getConfig('ultimoRespaldo'),
      equipos: count,
    });
    setRecent(finalized.slice(0, 5));
    setDraft(await getDraft());
    
    // Check for annual cleanup
    await checkAnnualCleanup(evals);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) {
      loadUser().then((u) => { if (!u) navigate('/registro', { replace: true }); });
    }
  }, [user, loadUser, navigate]);

  const newEvaluation = async () => {
    await startEval(user);
    navigate('/evaluacion');
  };
  const continueDraft = () => {
    loadInto(draft);
    navigate('/evaluacion');
  };
  const deleteDraft = async () => {
    if (draft) { await deleteEvaluationCascade(draft.id); await logEvent(LOG.ELIMINAR, draft.id); }
    setConfirmDraft(false);
    setDraft(null);
    refresh();
  };

  const handleKeepEvaluations = async () => {
    const currentYear = new Date().getFullYear();
    await setConfig('ultimoAnioVerificado', currentYear);
    setShowCleanupPrompt(false);
    toast.info('Se conservaron las evaluaciones del año anterior.');
  };

  const handleStartCleanup = () => {
    setShowCleanupPrompt(false);
    setShowCleanupConfirm(true);
  };

  const handleConfirmCleanup = async () => {
    setShowCleanupConfirm(false);
    const currentYear = new Date().getFullYear();
    const evals = await getAllEvaluations();
    const pastEvals = evals.filter((e) => {
      if (!e.fecha || !e.fecha.includes('/')) return false;
      const year = Number(e.fecha.split('/')[2]);
      return year < currentYear;
    });

    toast.info(`Eliminando ${pastEvals.length} evaluaciones del año anterior...`);

    try {
      for (const e of pastEvals) {
        await deleteEvaluationCascade(e.id);
        await logEvent(LOG.ELIMINAR, `Borrado anual: ${e.id}`);
      }
      await setConfig('ultimoAnioVerificado', currentYear);
      toast.success('Borrado anual de evaluaciones completado.');
      refresh();
    } catch (err) {
      toast.error('Error al realizar el borrado anual.');
    }
  };

  const unitName = (u) => getUnitById(u)?.nombre || u;
  const roomName = (r) => getRoomById(r)?.nombre || r;

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-tight" style={{ fontWeight: 700 }} data-testid="dash-username">
            {user?.nombre || 'Evaluador'}
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
            {getCityName(user?.ciudad)} · {unitName(user?.unidad)}
          </p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {formatDate(now)} · {formatTime(now)}
          </p>
        </div>
        <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Versión {appConfig.version}</span>
      </header>

      {/* Draft recovery */}
      {draft && (
        <div className="px-6 mb-2">
          <Card className="border border-[hsl(var(--warning)/0.4)]" testId="draft-banner">
            <div className="flex items-start gap-3">
              <AlertCircle size={22} className="text-[hsl(var(--warning))] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold" style={{ fontWeight: 600 }}>Tienes una evaluación pendiente.</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{draft.id}</p>
                <div className="mt-3">
                  <Button onClick={continueDraft} testId="draft-continue-btn">Continuar</Button>
                </div>
              </div>
              <button
                onClick={() => setConfirmDraft(true)} data-testid="draft-delete-btn"
                className="h-9 w-9 flex items-center justify-center rounded-full bg-[hsl(var(--muted))] shrink-0"
                aria-label="Eliminar evaluación pendiente"
              >
                <Trash2 size={17} className="text-destructive" />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Resumen */}
      <div className="px-6 grid grid-cols-2 gap-3 mb-4">
        <StatsCard label="Evaluaciones realizadas" value={stats.realizadas} testId="stat-realizadas" />
        <StatsCard label="Equipos en inventario" value={stats.equipos} testId="stat-equipos" />
        <StatsCard label="Respaldos generados" value={stats.respaldos} testId="stat-respaldos" />
        <StatsCard label="Pendientes de respaldar" value={stats.pendientes} accent testId="stat-pendientes" />
      </div>

      {/* Acciones rápidas */}
      <div className="px-6 flex flex-col gap-3 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <Button onClick={newEvaluation} icon={Plus} testId="dash-nueva-btn">Evaluación</Button>
          <Button onClick={() => navigate('/inventario')} icon={Package} variant="secondary" testId="dash-inventario-btn">Inventario</Button>
          <Button onClick={() => navigate('/pendientes')} icon={AlertCircle} variant="secondary" testId="dash-pendientes-btn">Pendientes</Button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Button variant="secondary" icon={ClipboardList} fullWidth onClick={() => navigate('/historial')} testId="dash-historial-btn">Historial</Button>
          <Button variant="secondary" icon={Database} fullWidth onClick={() => navigate('/respaldos')} testId="dash-respaldos-btn">Respaldos</Button>
          <Button variant="secondary" icon={Settings} fullWidth onClick={() => navigate('/configuracion')} testId="dash-config-btn">Ajustes</Button>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="px-6">
        <h2 className="text-lg font-semibold mb-3" style={{ fontWeight: 600 }}>Actividad reciente</h2>
        {recent.length === 0 ? (
          <Card><p className="text-[hsl(var(--muted-foreground))] text-sm">Aún no hay evaluaciones.</p></Card>
        ) : (
          <div className="flex flex-col gap-3">
            {recent.map((e) => (
              <Card key={e.id} testId={`recent-${e.id}`} onClick={() => { loadInto(e); navigate(`/detalle/${e.id}`); }} padding="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{e.fecha}</p>
                    <p className="font-semibold truncate" style={{ fontWeight: 600 }}>{unitName(e.unidad)}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">{roomName(e.cuarto)}</p>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap
                    ${e.estado === ESTADO.RESPALDADO ? 'bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]' : 'bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))]'}`}>
                    {e.estado === ESTADO.RESPALDADO ? 'Respaldado' : 'Respaldo Pendiente'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDraft}
        title="¿Eliminar evaluación pendiente?"
        description="Se eliminará el borrador y sus fotografías. Esta acción no puede deshacerse."
        onConfirm={deleteDraft}
        onCancel={() => setConfirmDraft(false)}
      />

      <ConfirmDialog
        open={showCleanupPrompt}
        title={`¿Limpiar evaluaciones de ${cleanupYear}?`}
        description={`Se ha detectado el inicio de un nuevo año. ¿Deseas eliminar las evaluaciones del año anterior (${cleanupYear}) para liberar espacio local? El inventario de equipos y las configuraciones no se verán afectados.`}
        onConfirm={handleStartCleanup}
        onCancel={handleKeepEvaluations}
        confirmText="Sí, limpiar"
      />

      <ConfirmDialog
        open={showCleanupConfirm}
        title="¿Estás completamente seguro?"
        description={`Esta acción eliminará de forma permanente todas las evaluaciones del año anterior (${cleanupYear}) y sus fotografías locales del dispositivo. Esta acción NO se puede deshacer.`}
        onConfirm={handleConfirmCleanup}
        onCancel={() => setShowCleanupConfirm(false)}
        confirmText="Sí, eliminar de todos modos"
      />
    </div>
  );
}
