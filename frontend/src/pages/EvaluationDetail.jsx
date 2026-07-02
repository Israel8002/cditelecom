import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { FileText, FileJson, Trash2, Download, Share2, Image as ImageIcon, Home } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import { getEvaluation, getPhotos, deleteEvaluationCascade, getBackupByEvaluation } from '../services/storage.service';
import { getUnitById, getRoomById, getCityName, getAllQuestions, isQuestionVisible, getSectionName, computeScore } from '../services/catalog.service';
import { useUserStore } from '../stores/user.store';
import { generatePdf, generatePhotographicPdf, generateOficioPdf, downloadBlob, shareFile } from '../services/backup.service';
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
  const [genPdf, setGenPdf] = useState(false);
  const [genPdfFotos, setGenPdfFotos] = useState(false);
  const [genOficio, setGenOficio] = useState(false);
  const [showOficioModal, setShowOficioModal] = useState(false);
  const [oficioForm, setOficioForm] = useState({
    directorNombre: localStorage.getItem('oficio_directorNombre') || 'C. DIRECTOR DE LA UNIDAD',
    directorCargo: localStorage.getItem('oficio_directorCargo') || 'Director de la Unidad',
    tipoAtencion: localStorage.getItem('oficio_tipoAtencion') || 'Administrador',
    atencionNombre: localStorage.getItem('oficio_atencionNombre') || 'ADMINISTRADOR DE LA UNIDAD',
    condicion: localStorage.getItem('oficio_condicion') || 'Encargado',
    customCargo: localStorage.getItem('oficio_customCargo') || 'Administrador del Sitio',
  });

  const load = useCallback(async () => {
    const e = await getEvaluation(id);
    setEvaluation(e);
    setPhotos(await getPhotos(id));
    setBackup(await getBackupByEvaluation(id));
    if (!user) loadUser();
  }, [id, user, loadUser]);
  useEffect(() => { load(); }, [load]);

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
    (sectionsData[q.seccion] = sectionsData[q.seccion] || []).push({ id: q.id, titulo: q.titulo, value: v });
  });

  const handleGeneratePdf = async () => {
    setGenPdf(true);
    try {
      const b = await generatePdf(evaluation, user);
      setBackup(b); await load();
      toast.success('PDF generado correctamente.');
    } catch (e) {
      await logEvent(LOG.ERROR, `PDF: ${e.message}`);
      toast.error(TXT.errPDF);
    } finally { setGenPdf(false); }
  };

  const handleGeneratePdfFotos = async () => {
    setGenPdfFotos(true);
    try {
      const b = await generatePhotographicPdf(evaluation, user);
      setBackup(b); await load();
      toast.success('Reporte Fotográfico generado correctamente.');
    } catch (e) {
      await logEvent(LOG.ERROR, `PDF Fotos: ${e.message}`);
      toast.error('Error al generar el Reporte Fotográfico.');
    } finally { setGenPdfFotos(false); }
  };

  const handleGenerateOficio = async () => {
    localStorage.setItem('oficio_directorNombre', oficioForm.directorNombre);
    localStorage.setItem('oficio_directorCargo', oficioForm.directorCargo);
    localStorage.setItem('oficio_tipoAtencion', oficioForm.tipoAtencion);
    localStorage.setItem('oficio_atencionNombre', oficioForm.atencionNombre);
    localStorage.setItem('oficio_condicion', oficioForm.condicion);
    localStorage.setItem('oficio_customCargo', oficioForm.customCargo);

    const atencionCargo = oficioForm.tipoAtencion === 'Otro'
      ? oficioForm.customCargo
      : (oficioForm.tipoAtencion + ' ' + oficioForm.condicion).trim();

    setGenOficio(true);
    setShowOficioModal(false);
    try {
      const b = await generateOficioPdf(evaluation, user, {
        directorNombre: oficioForm.directorNombre,
        directorCargo: oficioForm.directorCargo,
        atencionNombre: oficioForm.atencionNombre,
        atencionCargo: atencionCargo,
      });
      setBackup(b); await load();
      toast.success('Oficio de Evaluación generado correctamente.');
      downloadBlob(b.pdfOficio, b.pdfOficioNombre);
    } catch (e) {
      await logEvent(LOG.ERROR, `Oficio: ${e.message}`);
      toast.error('Error al generar el Oficio de Evaluación.');
    } finally { setGenOficio(false); }
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
              {list.map((r) => (
                <div key={r.id} className="flex justify-between gap-4 py-2.5 first:pt-0">
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
              {evaluation.observaciones.map((o, i) => <li key={`${o.text}-${i}`}>{o.text}</li>)}
            </ul>
          </Card>
        )}

        {/* Archivos */}
        <Card>
          <p className="font-semibold mb-3" style={{ fontWeight: 600 }}>Archivos</p>
          <div className="flex flex-col gap-3">
            {/* PDF */}
            {!backup?.pdf ? (
              <Button onClick={handleGeneratePdf} loading={genPdf} icon={FileText} testId="detail-generate-pdf">Generar PDF</Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" icon={Download} onClick={() => { downloadBlob(backup.pdf, backup.pdfNombre); logEvent(LOG.DESCARGA, backup.pdfNombre); }} testId="detail-download-pdf">Descargar PDF</Button>
                <Button variant="outline" icon={Share2} onClick={() => shareFile(backup.pdf, backup.pdfNombre)} testId="detail-share-pdf">Compartir PDF</Button>
              </div>
            )}
            {/* Reporte Fotográfico */}
            {!backup?.pdfFotos ? (
              <Button onClick={handleGeneratePdfFotos} loading={genPdfFotos} icon={ImageIcon} testId="detail-generate-pdf-fotos">Generar Reporte Fotográfico</Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" icon={Download} onClick={() => { downloadBlob(backup.pdfFotos, backup.pdfFotosNombre); logEvent(LOG.DESCARGA, backup.pdfFotosNombre); }} testId="detail-download-pdf-fotos">Descargar Reporte Foto</Button>
                <Button variant="outline" icon={Share2} onClick={() => shareFile(backup.pdfFotos, backup.pdfFotosNombre)} testId="detail-share-pdf-fotos">Compartir Reporte Foto</Button>
              </div>
            )}
            {/* Oficio de Evaluación */}
            {!backup?.pdfOficio ? (
              <Button onClick={() => setShowOficioModal(true)} loading={genOficio} icon={FileText} testId="detail-generate-oficio">Generar Oficio de Evaluación</Button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <Button variant="secondary" icon={Download} onClick={() => { downloadBlob(backup.pdfOficio, backup.pdfOficioNombre); logEvent(LOG.DESCARGA, backup.pdfOficioNombre); }} testId="detail-download-oficio">Descargar Oficio</Button>
                <Button variant="outline" icon={Share2} onClick={() => shareFile(backup.pdfOficio, backup.pdfOficioNombre)} testId="detail-share-oficio">Compartir</Button>
                <Button variant="outline" onClick={() => setShowOficioModal(true)} testId="detail-edit-oficio">Editar Oficio</Button>
              </div>
            )}
          </div>
        </Card>

        {/* Regresar al inicio */}
        <Button icon={Home} onClick={() => navigate('/dashboard')} testId="detail-home-btn">Regresar al Inicio</Button>
      </div>

      <ConfirmDialog open={confirm} title={TXT.confirmEliminar} description={TXT.confirmEliminarDesc}
        onConfirm={handleDelete} onCancel={() => setConfirm(false)} />

      {showOficioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[16px] w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="font-bold text-lg" style={{ fontWeight: 700 }}>Datos del Oficio</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Ingresa los datos del destinatario para generar el Oficio Oficial de Evaluación.</p>
            
            <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-semibold block mb-1">Nombre Director</label>
                <input type="text" value={oficioForm.directorNombre} onChange={e => setOficioForm({...oficioForm, directorNombre: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]" />
              </div>
              
              <div>
                <label className="text-xs font-semibold block mb-1">Puesto Director</label>
                <input type="text" value={oficioForm.directorCargo} onChange={e => setOficioForm({...oficioForm, directorCargo: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]" />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Tipo de Atención</label>
                <select value={oficioForm.tipoAtencion} onChange={e => setOficioForm({...oficioForm, tipoAtencion: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]" >
                  <option value="Administrador">Administrador</option>
                  <option value="Ingeniero de Conservación">Ingeniero de Conservación</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Nombre (Atención)</label>
                <input type="text" value={oficioForm.atencionNombre} onChange={e => setOficioForm({...oficioForm, atencionNombre: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]" />
              </div>

              {oficioForm.tipoAtencion !== 'Otro' ? (
                <div>
                  <label className="text-xs font-semibold block mb-1">Especificar Cargo (ej. Encargado, Responsable, Titular)</label>
                  <input type="text" value={oficioForm.condicion} onChange={e => setOficioForm({...oficioForm, condicion: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]" />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold block mb-1">Cargo a Especificar</label>
                  <input type="text" value={oficioForm.customCargo} onChange={e => setOficioForm({...oficioForm, customCargo: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]" />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => setShowOficioModal(false)}>Cancelar</Button>
              <Button onClick={handleGenerateOficio}>Generar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
