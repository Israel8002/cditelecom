import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { FileText, FileJson, Trash2, Download, Share2, Image as ImageIcon } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import { getEvaluation, getPhotos, deleteEvaluationCascade, getBackupByEvaluation } from '../services/storage.service';
import { getUnitById, getRoomById, getCityName, getAllQuestions, isQuestionVisible, getSectionName, computeScore } from '../services/catalog.service';
import { useUserStore } from '../stores/user.store';
import { generateBackup, downloadBlob, shareFile } from '../services/backup.service';
import { logEvent, LOG } from '../services/log.service';
import { TXT, ESTADO } from '../catalogs/constants';

export default function EvaluationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const loadUser = useUserStore((s) => s.load);
  const [evaluation, setEvaluation] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [backup, setBackup] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [gen, setGen] = useState(false);

  const load = async () => {
    const e = await getEvaluation(id);
    setEvaluation(e);
    setPhotos(await getPhotos(id));
    setBackup(await getBackupByEvaluation(id));
    if (!user) loadUser();
  };
  useEffect(() => { load(); }, [id]);

  if (!evaluation) return <div className="app-shell"><PageHeader title="Detalle" onBack={() => navigate(-1)} /></div>;

  const unit = getUnitById(evaluation.unidad);
  const room = getRoomById(evaluation.cuarto);
  const score = computeScore(evaluation.answers || {});
  const answers = evaluation.answers || {};

  const sectionsData = {};
  getAllQuestions().forEach((q) => {
    if (!isQuestionVisible(q, answers)) return;
    const v = answers[q.id];
    if (v === undefined || v === '' || v === null) return;
    if (q.id === 'Q041') return;
    (sectionsData[q.seccion] = sectionsData[q.seccion] || []).push({ titulo: q.titulo, value: v });
  });

  const handleGenerate = async () => {
    setGen(true);
    try {
      const b = await generateBackup(evaluation, user);
      setBackup(b);
      await load();
      toast.success('Archivo generado correctamente.');
    } catch (e) {
      await logEvent(LOG.ERROR, `PDF/JSON: ${e.message}`);
      toast.error(TXT.errRespaldo);
    } finally { setGen(false); }
  };

  const handleDelete = async () => {
    await deleteEvaluationCascade(id);
    await logEvent(LOG.ELIMINAR, id);
    toast.success('Evaluación eliminada');
    navigate('/historial', { replace: true });
  };

  const info = [
    ['Folio', evaluation.id], ['Fecha', `${evaluation.fecha} ${evaluation.hora}`],
    ['Ciudad', getCityName(user?.ciudad)], ['Unidad', unit ? `${unit.nombre} (ID ${unit.id})` : ''],
    ['Cuarto', room?.nombre], ['Evaluador', user?.nombre],
    ['Resultado', `${score.porcentaje}% · ${score.clasificacion}`],
  ];

  return (
    <div className="app-shell pb-10">
      <PageHeader title="Detalle de evaluación" subtitle={evaluation.id} onBack={() => navigate(-1)}
        right={(
          <button onClick={() => setConfirm(true)} data-testid="detail-delete-btn"
            className="h-10 w-10 flex items-center justify-center rounded-full bg-[hsl(var(--muted))]">
            <Trash2 size={18} className="text-destructive" />
          </button>
        )} />

      <div className="px-6 flex flex-col gap-4">
        {/* Info general */}
        <Card>
          <p className="font-semibold mb-3" style={{ fontWeight: 600 }}>Información general</p>
          <div className="flex flex-col divide-y divide-[hsl(var(--border))]">
            {info.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5 first:pt-0">
                <span className="text-[hsl(var(--muted-foreground))] text-sm">{k}</span>
                <span className="font-medium text-right text-sm" style={{ fontWeight: 500 }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Fotografías */}
        {photos.length > 0 && (
          <Card>
            <p className="font-semibold mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}><ImageIcon size={18} />Fotografías ({photos.length})</p>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p) => (
                <div key={p.id} className="aspect-square rounded-[12px] overflow-hidden bg-[hsl(var(--muted))]">
                  <img src={URL.createObjectURL(p.blob)} alt={p.nombre} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Resultados */}
        {Object.entries(sectionsData).map(([sec, list]) => (
          <Card key={sec}>
            <p className="font-semibold mb-3" style={{ fontWeight: 600 }}>{getSectionName(sec)}</p>
            <div className="flex flex-col divide-y divide-[hsl(var(--border))]">
              {list.map((r, i) => (
                <div key={i} className="flex justify-between gap-4 py-2.5 first:pt-0">
                  <span className="text-[hsl(var(--muted-foreground))] text-sm">{r.titulo}</span>
                  <span className="font-medium text-right text-sm" style={{ fontWeight: 500 }}>{String(r.value)}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* Observaciones */}
        {(evaluation.observaciones || []).length > 0 && (
          <Card>
            <p className="font-semibold mb-2" style={{ fontWeight: 600 }}>Observaciones</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm">
              {evaluation.observaciones.map((o, i) => <li key={i}>{o.text}</li>)}
            </ul>
          </Card>
        )}

        {/* Archivos */}
        <Card>
          <p className="font-semibold mb-3" style={{ fontWeight: 600 }}>Archivos</p>
          {!backup ? (
            <Button onClick={handleGenerate} loading={gen} icon={FileText} testId="detail-generate-btn">Generar PDF y JSON</Button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-[hsl(var(--success))] mb-1">Archivos generados correctamente.</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" icon={Download} onClick={() => { downloadBlob(backup.pdf, backup.pdfNombre); logEvent(LOG.DESCARGA, backup.pdfNombre); }} testId="detail-download-pdf">PDF</Button>
                <Button variant="secondary" icon={Download} onClick={() => { downloadBlob(backup.json, backup.jsonNombre, 'application/json'); logEvent(LOG.DESCARGA, backup.jsonNombre); }} testId="detail-download-json">JSON</Button>
                <Button variant="outline" icon={Share2} onClick={() => shareFile(backup.pdf, backup.pdfNombre)} testId="detail-share-pdf">Compartir PDF</Button>
                <Button variant="outline" icon={FileJson} onClick={() => shareFile(backup.json, backup.jsonNombre, 'application/json')} testId="detail-share-json">Compartir JSON</Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog open={confirm} title={TXT.confirmEliminar} description={TXT.confirmEliminarDesc}
        onConfirm={handleDelete} onCancel={() => setConfirm(false)} />
    </div>
  );
}
