import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Database, Download, Share2, FileText } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import BottomNavigation from '../components/BottomNavigation';
import { getAllEvaluations, getAllBackups } from '../services/storage.service';
import { getUnitById, getRoomById } from '../services/catalog.service';
import { generateBackup, downloadBlob, shareFile } from '../services/backup.service';
import { getLogs, logEvent, LOG } from '../services/log.service';
import { useUserStore } from '../stores/user.store';
import { TXT, ESTADO } from '../catalogs/constants';

export default function Backups() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const [evals, setEvals] = useState([]);
  const [backups, setBackups] = useState({});
  const [logs, setLogs] = useState([]);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    const all = (await getAllEvaluations()).filter((e) => e.estado !== 'borrador');
    setEvals(all);
    const bks = await getAllBackups();
    const map = {}; bks.forEach((b) => { map[b.idEvaluacion] = b; });
    setBackups(map);
    const allLogs = await getLogs();
    setLogs(allLogs.filter((l) => [LOG.PDF, LOG.JSON, LOG.RESPALDO, LOG.DESCARGA].includes(l.tipo)).slice(0, 50));
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unitName = (u) => getUnitById(u)?.nombre || String(u);
  const roomName = (r) => getRoomById(r)?.nombre || String(r);

  const doGenerate = async (e) => {
    setBusy(e.id);
    try { await generateBackup(e, user); toast.success('Respaldo generado correctamente.'); await load(); }
    catch (err) { await logEvent(LOG.ERROR, err.message); toast.error(TXT.errRespaldo); }
    finally { setBusy(null); }
  };

  return (
    <div className="app-shell">
      <PageHeader title="Respaldos" subtitle="Genera y administra archivos" onBack={() => navigate('/dashboard')} />

      <div className="px-6">
        {evals.length === 0 ? (
          <EmptyState icon={Database} title="Sin evaluaciones" description="Realiza una evaluación para generar respaldos." testId="backups-empty" />
        ) : (
          <div className="flex flex-col gap-3">
            {evals.map((e) => {
              const b = backups[e.id];
              return (
                <Card key={e.id} testId={`backup-${e.id}`} padding="p-4">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{e.id}</p>
                  <p className="font-semibold mt-1" style={{ fontWeight: 600 }}>{unitName(e.unidad)}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">{roomName(e.cuarto)} · {e.fecha}</p>
                  {!b ? (
                    <Button icon={FileText} loading={busy === e.id} onClick={() => doGenerate(e)} testId={`backup-gen-${e.id}`}>Generar Respaldo</Button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="secondary" icon={Download} onClick={() => { downloadBlob(b.pdf, b.pdfNombre); logEvent(LOG.DESCARGA, b.pdfNombre); }} testId={`backup-dl-pdf-${e.id}`}>PDF</Button>
                      <Button variant="secondary" icon={Download} onClick={() => { downloadBlob(b.json, b.jsonNombre, 'application/json'); logEvent(LOG.DESCARGA, b.jsonNombre); }} testId={`backup-dl-json-${e.id}`}>JSON</Button>
                      <Button variant="outline" icon={Share2} onClick={() => shareFile(b.pdf, b.pdfNombre)}>Compartir PDF</Button>
                      <Button variant="outline" icon={Share2} onClick={() => shareFile(b.json, b.jsonNombre, 'application/json')}>Compartir JSON</Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Log */}
        <h2 className="text-lg font-semibold mt-8 mb-3" style={{ fontWeight: 600 }}>Registro de respaldos</h2>
        {logs.length === 0 ? (
          <Card><p className="text-sm text-[hsl(var(--muted-foreground))]">Sin registros aún.</p></Card>
        ) : (
          <Card padding="p-0">
            <div className="flex flex-col divide-y divide-[hsl(var(--border))]">
              {logs.map((l, i) => (
                <div key={`${l.fechaISO || l.fecha}-${i}`} className="flex justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium" style={{ fontWeight: 500 }}>{l.tipo}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] truncate max-w-[200px]">{l.descripcion}</p>
                  </div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">{l.fecha} {l.hora}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}
