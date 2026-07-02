import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Database, Download, Share2, FileText, Image as ImageIcon } from 'lucide-react';
import Select from '../components/Select';
import Input from '../components/Input';
import { exportEvaluationsToExcel } from '../services/excel.service';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import BottomNavigation from '../components/BottomNavigation';
import { getAllEvaluations, getAllBackups, getAllEquipos } from '../services/storage.service';
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

  const [filterType, setFilterType] = useState('all');
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const yearsOptions = useMemo(() => {
    const years = new Set();
    evals.forEach((e) => {
      if (e.fecha && e.fecha.includes('/')) {
        const parts = e.fecha.split('/');
        if (parts[2]) years.add(parts[2]);
      }
    });
    if (years.size === 0) {
      years.add(String(new Date().getFullYear()));
    }
    return Array.from(years)
      .sort()
      .reverse()
      .map((y) => ({ value: y, label: String(y) }));
  }, [evals]);

  const handleExportExcel = async () => {
    let filtered = [...evals];
    
    if (filterType === 'year') {
      filtered = evals.filter((e) => {
        if (!e.fecha || !e.fecha.includes('/')) return false;
        const year = e.fecha.split('/')[2];
        return year === selectedYear;
      });
    } else if (filterType === 'range') {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      filtered = evals.filter((e) => {
        if (!e.fecha || !e.fecha.includes('/')) return false;
        const [d, m, y] = e.fecha.split('/').map(Number);
        const evalDate = new Date(y, m - 1, d);
        if (start && evalDate < start) return false;
        if (end && evalDate > end) return false;
        return true;
      });
    }

    if (filtered.length === 0) {
      toast.error('No hay evaluaciones que coincidan con el filtro seleccionado.');
      return;
    }

    try {
      const equipos = await getAllEquipos();
      exportEvaluationsToExcel(filtered, equipos, user, `evaluaciones_respaldo.xlsx`);
      toast.success('Excel exportado correctamente.');
      logEvent(LOG.DESCARGA, 'evaluaciones_respaldo.xlsx');
    } catch (err) {
      toast.error('Error al exportar a Excel.');
      logEvent(LOG.ERROR, `Excel: ${err.message}`);
    }
  };

  const handleDlFotos = async (e, b) => {
    if (b.pdfFotos) {
      downloadBlob(b.pdfFotos, b.pdfFotosNombre);
      logEvent(LOG.DESCARGA, b.pdfFotosNombre);
    } else {
      setBusy(e.id);
      toast.info("Generando reporte fotográfico...");
      try {
        const updatedBk = await generateBackup(e, user);
        await load();
        downloadBlob(updatedBk.pdfFotos, updatedBk.pdfFotosNombre);
        logEvent(LOG.DESCARGA, updatedBk.pdfFotosNombre);
      } catch (err) {
        toast.error("Error al generar reporte de fotos.");
      } finally {
        setBusy(null);
      }
    }
  };

  const handleShareFotos = async (e, b) => {
    if (b.pdfFotos) {
      shareFile(b.pdfFotos, b.pdfFotosNombre);
    } else {
      setBusy(e.id);
      toast.info("Generando reporte fotográfico...");
      try {
        const updatedBk = await generateBackup(e, user);
        await load();
        shareFile(updatedBk.pdfFotos, updatedBk.pdfFotosNombre);
      } catch (err) {
        toast.error("Error al generar reporte de fotos.");
      } finally {
        setBusy(null);
      }
    }
  };

  const handleDlOficio = async (e, b) => {
    if (b.pdfOficio) {
      downloadBlob(b.pdfOficio, b.pdfOficioNombre);
      logEvent(LOG.DESCARGA, b.pdfOficioNombre);
    } else {
      setBusy(e.id);
      toast.info("Generando oficio de evaluación...");
      try {
        const updatedBk = await generateBackup(e, user);
        await load();
        downloadBlob(updatedBk.pdfOficio, updatedBk.pdfOficioNombre);
        logEvent(LOG.DESCARGA, updatedBk.pdfOficioNombre);
      } catch (err) {
        toast.error("Error al generar oficio de evaluación.");
      } finally {
        setBusy(null);
      }
    }
  };

  const handleShareOficio = async (e, b) => {
    if (b.pdfOficio) {
      shareFile(b.pdfOficio, b.pdfOficioNombre);
    } else {
      setBusy(e.id);
      toast.info("Generando oficio de evaluación...");
      try {
        const updatedBk = await generateBackup(e, user);
        await load();
        shareFile(updatedBk.pdfOficio, updatedBk.pdfOficioNombre);
      } catch (err) {
        toast.error("Error al generar oficio de evaluación.");
      } finally {
        setBusy(null);
      }
    }
  };

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
        {/* Export to Excel Card */}
        {evals.length > 0 && (
          <Card className="mb-6" padding="p-5">
            <h2 className="text-lg font-semibold mb-2" style={{ fontWeight: 600 }}>Exportar Evaluaciones a Excel</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
              Genera un archivo Excel (.xlsx) con los datos consolidados de las auditorías.
            </p>
            <div className="flex flex-col gap-4">
              <Select
                label="Tipo de Filtro"
                value={filterType}
                onChange={setFilterType}
                options={[
                  { value: 'all', label: 'Todas las evaluaciones' },
                  { value: 'year', label: 'Por año' },
                  { value: 'range', label: 'Por rango de fechas' }
                ]}
              />

              {filterType === 'year' && (
                <Select
                  label="Seleccionar Año"
                  value={selectedYear}
                  onChange={setSelectedYear}
                  options={yearsOptions}
                />
              )}

              {filterType === 'range' && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Fecha Inicio"
                    type="date"
                    value={startDate}
                    onChange={setStartDate}
                  />
                  <Input
                    label="Fecha Fin"
                    type="date"
                    value={endDate}
                    onChange={setEndDate}
                  />
                </div>
              )}

              <Button onClick={handleExportExcel} icon={Download} testId="export-excel-btn">
                Exportar a Excel
              </Button>
            </div>
          </Card>
        )}

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
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-4 gap-2">
                        <Button variant="secondary" icon={Download} onClick={() => { downloadBlob(b.pdf, b.pdfNombre); logEvent(LOG.DESCARGA, b.pdfNombre); }} testId={`backup-dl-pdf-${e.id}`}>PDF</Button>
                        <Button variant="secondary" icon={Download} onClick={() => handleDlFotos(e, b)} testId={`backup-dl-pdf-fotos-${e.id}`}>Fotos</Button>
                        <Button variant="secondary" icon={Download} onClick={() => handleDlOficio(e, b)} testId={`backup-dl-pdf-oficio-${e.id}`}>Oficio</Button>
                        <Button variant="secondary" icon={Download} onClick={() => { downloadBlob(b.json, b.jsonNombre, 'application/json'); logEvent(LOG.DESCARGA, b.jsonNombre); }} testId={`backup-dl-json-${e.id}`}>JSON</Button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <Button variant="outline" icon={Share2} onClick={() => shareFile(b.pdf, b.pdfNombre)} testId={`backup-share-pdf-${e.id}`}>Ev. Share</Button>
                        <Button variant="outline" icon={Share2} onClick={() => handleShareFotos(e, b)} testId={`backup-share-pdf-fotos-${e.id}`}>Fotos Share</Button>
                        <Button variant="outline" icon={Share2} onClick={() => handleShareOficio(e, b)} testId={`backup-share-pdf-oficio-${e.id}`}>Oficio Share</Button>
                        <Button variant="outline" icon={Share2} onClick={() => shareFile(b.json, b.jsonNombre, 'application/json')} testId={`backup-share-json-${e.id}`}>JSON Share</Button>
                      </div>
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
