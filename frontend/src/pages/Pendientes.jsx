import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, ChevronRight, RefreshCw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { usePendienteStore } from '../stores/pendiente.store';
import { getUnitById, getCityName } from '../services/catalog.service';

export default function Pendientes() {
  const navigate = useNavigate();
  const { pendientes, loading, sync, loadAll } = usePendienteStore();
  const [activeTab, setActiveTab] = useState('pendientes'); // 'pendientes' | 'resueltos'
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    await sync();
    setSyncing(false);
  };

  // Group findings by Unit
  const groupedUnits = useMemo(() => {
    const map = {};

    pendientes.forEach((p) => {
      const match = activeTab === 'pendientes' ? !p.resolved : p.resolved;
      if (!match) return;

      if (!map[p.unidadId]) {
        const unit = getUnitById(p.unidadId);
        map[p.unidadId] = {
          id: p.unidadId,
          nombre: unit ? unit.nombre : `Unidad ${p.unidadId}`,
          ciudad: unit ? getCityName(unit.ciudadId) : '',
          count: 0,
        };
      }
      map[p.unidadId].count += 1;
    });

    return Object.values(map).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [pendientes, activeTab]);

  return (
    <div className="app-shell pb-12">
      <PageHeader
        title="Pendientes por Resolver"
        subtitle="Monitoreo de hallazgos detectados en sitio"
        onBack={() => navigate('/dashboard')}
      />

      {/* Sync trigger & tab selector */}
      <div className="px-6 mb-6 flex flex-col gap-4">
        <div className="flex gap-2 p-1 bg-[hsl(var(--muted))] rounded-[16px]">
          <button
            onClick={() => setActiveTab('pendientes')}
            className={`flex-1 py-3 px-4 rounded-[12px] text-sm font-semibold flex items-center justify-center gap-2 transition-all
              ${activeTab === 'pendientes'
                ? 'bg-[hsl(var(--card))] text-foreground shadow-sm'
                : 'text-[hsl(var(--muted-foreground))] hover:text-foreground'}`}
          >
            <AlertCircle size={16} className={activeTab === 'pendientes' ? 'text-destructive' : ''} />
            Pendientes
          </button>
          <button
            onClick={() => setActiveTab('resueltos')}
            className={`flex-1 py-3 px-4 rounded-[12px] text-sm font-semibold flex items-center justify-center gap-2 transition-all
              ${activeTab === 'resueltos'
                ? 'bg-[hsl(var(--card))] text-foreground shadow-sm'
                : 'text-[hsl(var(--muted-foreground))] hover:text-foreground'}`}
          >
            <CheckCircle size={16} className={activeTab === 'resueltos' ? 'text-success' : ''} />
            Resueltos
          </button>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {activeTab === 'pendientes'
              ? 'Unidades con hallazgos que requieren atención'
              : 'Historial de hallazgos solucionados'}
          </p>
          <Button
            variant="secondary"
            className="h-8 text-xs gap-1.5 px-3 py-0 rounded-[10px] shrink-0"
            onClick={handleSync}
            disabled={syncing || loading}
          >
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Unit Cards List */}
      <div className="px-6 flex flex-col gap-3">
        {loading && !syncing ? (
          <Card>
            <p className="text-center py-6 text-[hsl(var(--muted-foreground))] text-sm">
              Cargando hallazgos...
            </p>
          </Card>
        ) : groupedUnits.length === 0 ? (
          <Card>
            <div className="text-center py-8 flex flex-col items-center justify-center gap-2">
              {activeTab === 'pendientes' ? (
                <>
                  <CheckCircle size={32} className="text-success" />
                  <p className="font-semibold text-sm">¡Excelente trabajo!</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-[280px]">
                    No se encontraron hallazgos pendientes en ninguna unidad evaluada.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle size={32} className="text-[hsl(var(--muted-foreground))]" />
                  <p className="font-semibold text-sm">Sin historial</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-[280px]">
                    Aún no se han marcado hallazgos como resueltos.
                  </p>
                </>
              )}
            </div>
          </Card>
        ) : (
          groupedUnits.map((u) => (
            <Card
              key={u.id}
              testId={`unit-group-${u.id}`}
              onClick={() => navigate(`/pendientes/unidad/${u.id}?tab=${activeTab}`)}
              padding="p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{u.ciudad}</p>
                  <h3 className="font-semibold text-base truncate mt-0.5" style={{ fontWeight: 600 }}>
                    {u.nombre}
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap
                      ${activeTab === 'pendientes'
                        ? 'bg-[hsl(var(--error)/0.15)] text-[hsl(var(--error))]'
                        : 'bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]'}`}
                  >
                    {u.count} {activeTab === 'pendientes' ? 'pendientes' : 'resueltos'}
                  </span>
                  <ChevronRight size={18} className="text-[hsl(var(--muted-foreground))]" />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
