import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Image as ImageIcon, X, Check } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ProgressBar from '../components/ProgressBar';
import SearchBox from '../components/SearchBox';
import Card from '../components/Card';
import Button from '../components/Button';
import QuestionView from '../components/wizard/QuestionView';
import { useUserStore } from '../stores/user.store';
import { useEvaluationStore } from '../stores/evaluation.store';
import { getUnitsByCity, getRoomsByUnit, getVisibleQuestions, getUnitById, getRoomById, getCityName, buildRecommendations } from '../services/catalog.service';
import { addPhoto, getPhotos, deletePhoto } from '../services/storage.service';
import { logEvent, LOG } from '../services/log.service';

const slide = {
  enter: { x: 40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
};

export default function NewEvaluation() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const { current, selectUnit, selectRoom, setAnswer, setObservacionesText, finalize } = useEvaluationStore();
  const [stepIndex, setStepIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const visibleQs = useMemo(() => getVisibleQuestions(current.answers || {}), [current.answers]);
  const steps = useMemo(() => ['unit', 'room', 'info', 'photos', ...visibleQs.map((q) => q.id), 'resumen'], [visibleQs]);
  const step = steps[stepIndex];
  const total = steps.length;

  const next = () => setStepIndex((i) => Math.min(i + 1, total - 1));
  const back = () => {
    if (stepIndex === 0) { navigate('/dashboard'); return; }
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  // Determinar el paso inicial al reanudar un borrador.
  useEffect(() => {
    if (current.id && !initialized) {
      setInitialized(true);
      if (current.estado === 'borrador' && current.unidad && current.cuarto) {
        const firstUnansweredIndex = visibleQs.findIndex(
          (q) => current.answers[q.id] === undefined || current.answers[q.id] === null || current.answers[q.id] === ''
        );
        if (firstUnansweredIndex !== -1) {
          const answeredCount = Object.keys(current.answers || {}).length;
          if (answeredCount === 0) {
            setStepIndex(3); // Fotos
          } else {
            const qId = visibleQs[firstUnansweredIndex].id;
            const idx = steps.indexOf(qId);
            if (idx !== -1) setStepIndex(idx);
          }
        } else if (Object.keys(current.answers || {}).length > 0) {
          setStepIndex(steps.indexOf('resumen'));
        } else {
          setStepIndex(3); // Fotos
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id, initialized]);

  // Pre-populate observations (Q042) with auto-generated recommendations
  useEffect(() => {
    if (step === 'Q042') {
      const currentAns = current.answers['Q042'];
      if (currentAns === undefined || currentAns === null || currentAns === '') {
        const autoRecs = buildRecommendations(current.answers || {});
        const generated = autoRecs.map((r) => `• ${r.text}`).join('\n');
        setAnswer('Q042', generated);
        setObservacionesText(generated);
      }
    }
  }, [step, current.answers, setAnswer, setObservacionesText]);

  // Si no hay evaluación activa, regresar.
  useEffect(() => { if (!current.id) navigate('/dashboard', { replace: true }); }, [current.id, navigate]);

  return (
    <div className="app-shell flex flex-col min-h-screen pb-6">
      <PageHeader title="Nueva Evaluación" onBack={back} />
      <div className="px-6 mb-2"><ProgressBar current={stepIndex + 1} total={total} /></div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step} variants={slide} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.25 }} className="h-full"
          >
            {step === 'unit' && <StepUnit user={user} onSelect={async (id) => { await selectUnit(id); next(); }} />}
            {step === 'room' && <StepRoom unitId={current.unidad} onSelect={async (id) => { await selectRoom(id); next(); }} />}
            {step === 'info' && <StepInfo evaluation={current} user={user} onNext={next} />}
            {step === 'photos' && <StepPhotos evaluationId={current.id} onNext={next} />}
            {visibleQs.some((q) => q.id === step) && (
              <QuestionView
                question={visibleQs.find((q) => q.id === step)}
                value={current.answers[step]}
                onAnswer={(v) => { setAnswer(step, v); if (step === 'Q042') setObservacionesText(v); }}
                onNext={next}
              />
            )}
            {step === 'resumen' && (
              <StepResumen evaluation={current} user={user} onSave={async () => { const e = await finalize(); navigate(`/detalle/${e.id}`); }} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepUnit({ user, onSelect }) {
  const [q, setQ] = useState('');
  const units = getUnitsByCity(user?.ciudad).filter((u) => u.nombre.toLowerCase().includes(q.toLowerCase()) || String(u.id).includes(q));
  return (
    <div className="px-6 pt-2">
      <h2 className="text-2xl font-bold leading-tight" style={{ fontWeight: 700 }}>Selecciona la Unidad</h2>
      <p className="text-[hsl(var(--muted-foreground))] mt-2 mb-4">Selecciona la unidad donde realizarás la evaluación.</p>
      <div className="mb-4"><SearchBox value={q} onChange={setQ} placeholder="Buscar unidad..." testId="search-unit" /></div>
      <div className="flex flex-col gap-3">
        {units.map((u) => (
          <Card key={u.id} onClick={() => onSelect(u.id)} testId={`unit-${u.id}`} padding="p-4">
            <p className="font-semibold" style={{ fontWeight: 600 }}>{u.nombre}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">ID {u.id} · {u.tipo}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StepRoom({ unitId, onSelect }) {
  const [q, setQ] = useState('');
  const rooms = getRoomsByUnit(unitId).filter((r) => r.nombre.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="px-6 pt-2">
      <h2 className="text-2xl font-bold leading-tight" style={{ fontWeight: 700 }}>Selecciona el cuarto</h2>
      <p className="text-[hsl(var(--muted-foreground))] mt-2 mb-4">Cuartos de telecomunicaciones de la unidad.</p>
      <div className="mb-4"><SearchBox value={q} onChange={setQ} placeholder="Buscar cuarto..." testId="search-room" /></div>
      {rooms.length === 0 && <p className="text-[hsl(var(--muted-foreground))] text-sm">Esta unidad no tiene cuartos registrados en el catálogo.</p>}
      <div className="flex flex-col gap-3">
        {rooms.map((r) => (
          <Card key={r.id} onClick={() => onSelect(r.id)} testId={`room-${r.id}`} padding="p-4">
            <p className="font-semibold" style={{ fontWeight: 600 }}>{r.nombre}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StepInfo({ evaluation, user, onNext }) {
  const unit = getUnitById(evaluation.unidad);
  const room = getRoomById(evaluation.cuarto);
  const rows = [
    ['Evaluación', evaluation.id],
    ['Fecha', evaluation.fecha],
    ['Hora', evaluation.hora],
    ['Evaluador', user?.nombre],
    ['Matrícula', user?.matricula],
    ['Ciudad', getCityName(user?.ciudad)],
    ['Unidad', unit ? `${unit.nombre} (ID ${unit.id})` : ''],
    ['Cuarto', room?.nombre],
  ];
  return (
    <div className="px-6 pt-2">
      <h2 className="text-2xl font-bold leading-tight" style={{ fontWeight: 700 }}>Información</h2>
      <p className="text-[hsl(var(--muted-foreground))] mt-2 mb-4">Datos generados automáticamente.</p>
      <Card>
        <div className="flex flex-col divide-y divide-[hsl(var(--border))]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
              <span className="font-semibold text-right" style={{ fontWeight: 600 }}>{v || '—'}</span>
            </div>
          ))}
        </div>
      </Card>
      <div className="mt-6"><Button onClick={onNext} testId="info-next-btn">Continuar</Button></div>
    </div>
  );
}

function StepPhotos({ evaluationId, onNext }) {
  const [photos, setPhotos] = useState([]);
  const camRef = useRef(null);
  const galRef = useRef(null);

  const reload = async () => setPhotos(await getPhotos(evaluationId));
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluationId]);

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) { await addPhoto(evaluationId, f); await logEvent(LOG.FOTO, f.name); }
    e.target.value = '';
    reload();
  };
  const remove = async (id) => { await deletePhoto(id); reload(); };

  return (
    <div className="px-6 pt-2">
      <h2 className="text-2xl font-bold leading-tight" style={{ fontWeight: 700 }}>Fotografías del cuarto</h2>
      <p className="text-[hsl(var(--muted-foreground))] mt-2 mb-4">Agrega todas las fotografías necesarias para documentar la evaluación.</p>

      <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFiles} data-testid="photo-camera-input" />
      <input ref={galRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} data-testid="photo-gallery-input" />

      <div className="flex flex-col gap-3 mb-5">
        <Button icon={Camera} onClick={() => camRef.current?.click()} testId="photo-camera-btn">Tomar fotografía</Button>
        <Button icon={ImageIcon} variant="secondary" onClick={() => galRef.current?.click()} testId="photo-gallery-btn">Seleccionar desde galería</Button>
      </div>

      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3" data-testid="photo-count">{photos.length} fotografías agregadas</p>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {photos.map((p) => (
          <div key={p.id} className="relative aspect-square rounded-[16px] overflow-hidden bg-[hsl(var(--muted))]">
            <img src={URL.createObjectURL(p.blob)} alt={p.nombre} className="w-full h-full object-cover" />
            <button onClick={() => remove(p.id)} data-testid={`photo-del-${p.id}`}
              className="absolute top-1 right-1 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center">
              <X size={15} className="text-white" />
            </button>
          </div>
        ))}
      </div>

      <Button onClick={onNext} testId="photos-next-btn">Continuar</Button>
    </div>
  );
}

function StepResumen({ evaluation, user, onSave }) {
  const [saving, setSaving] = useState(false);
  const unit = getUnitById(evaluation.unidad);
  const room = getRoomById(evaluation.cuarto);
  const answered = Object.keys(evaluation.answers || {}).length;
  const obs = evaluation.observaciones || [];
  const doSave = async () => { setSaving(true); await onSave(); };
  return (
    <div className="px-6 pt-2 pb-10">
      <h2 className="text-2xl font-bold leading-tight" style={{ fontWeight: 700 }}>Resumen</h2>
      <p className="text-[hsl(var(--muted-foreground))] mt-2 mb-4">Revisa antes de guardar.</p>
      <Card className="mb-3">
        <div className="flex flex-col divide-y divide-[hsl(var(--border))]">
          {[['Folio', evaluation.id], ['Unidad', unit?.nombre], ['Cuarto', room?.nombre], ['Evaluador', user?.nombre], ['Respuestas', answered]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
              <span className="font-semibold text-right" style={{ fontWeight: 600 }}>{v ?? '—'}</span>
            </div>
          ))}
        </div>
      </Card>
      {obs.length > 0 && (
        <Card className="mb-3">
          <p className="font-semibold mb-2" style={{ fontWeight: 600 }}>Observaciones</p>
          <ul className="flex flex-col gap-2">
            {obs.map((o, i) => (
              <li key={`${o.text}-${i}`} className="flex items-start gap-2 text-sm">
                <Check size={16} className="text-primary mt-0.5 shrink-0" />
                <span>{o.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <div className="mt-4"><Button onClick={doSave} loading={saving} testId="resumen-save-btn">Guardar evaluación</Button></div>
    </div>
  );
}
