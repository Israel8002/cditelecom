import { create } from 'zustand';
import { saveEvaluation, getDraft } from '../services/storage.service';
import { buildRecommendations } from '../services/catalog.service';
import { generateFolio, formatDate, formatTime } from '../services/format';
import { ESTADO } from '../catalogs/constants';
import { logEvent, LOG } from '../services/log.service';

const emptyEval = () => ({
  id: null,
  fecha: '',
  hora: '',
  unidad: null,
  cuarto: null,
  answers: {},
  observaciones: [],
  manualRemoved: [], // textos de recomendaciones eliminadas manualmente
  estado: ESTADO.PENDIENTE,
  fechaCreacion: null,
});

export const useEvaluationStore = create((set, get) => ({
  current: emptyEval(),

  // Persistencia inmediata (<100ms) tras cada cambio.
  persist: async () => {
    const e = get().current;
    if (!e.id) return;
    await saveEvaluation(e);
  },

  start: async (user) => {
    const now = new Date();
    const e = {
      ...emptyEval(),
      id: generateFolio(now),
      fecha: formatDate(now),
      hora: formatTime(now),
      estado: 'borrador',
      fechaCreacion: now.toISOString(),
      usuarioId: user?.id || 'singleton',
    };
    set({ current: e });
    await saveEvaluation(e);
    await logEvent(LOG.NUEVA_EVAL, e.id);
    return e;
  },

  loadDraft: async () => {
    const draft = await getDraft();
    if (draft) set({ current: { ...emptyEval(), ...draft } });
    return draft;
  },

  loadInto: (evaluation) => set({ current: { ...emptyEval(), ...evaluation } }),

  selectUnit: async (unitId) => {
    set((s) => ({ current: { ...s.current, unidad: unitId, cuarto: null } }));
    await get().persist();
  },
  selectRoom: async (roomId) => {
    set((s) => ({ current: { ...s.current, cuarto: roomId } }));
    await get().persist();
  },

  setAnswer: async (questionId, value) => {
    set((s) => {
      const answers = { ...s.current.answers, [questionId]: value };
      const current = { ...s.current, answers };
      // recalcular recomendaciones automáticas (respetando las eliminadas manualmente)
      const autoRecs = buildRecommendations(answers)
        .filter((r) => !current.manualRemoved.includes(r.text))
        .map((r) => ({ text: r.text, auto: true }));
      const manual = current.observaciones.filter((o) => !o.auto);
      current.observaciones = [...autoRecs, ...manual];
      return { current };
    });
    await get().persist();
  },

  setObservacionesText: async (text) => {
    set((s) => {
      const others = s.current.observaciones.filter((o) => o.kind !== 'libre');
      const list = text ? [...others, { text, auto: false, kind: 'libre' }] : others;
      return { current: { ...s.current, observaciones: list } };
    });
    await get().persist();
  },

  removeObservation: async (text) => {
    set((s) => ({
      current: {
        ...s.current,
        observaciones: s.current.observaciones.filter((o) => o.text !== text),
        manualRemoved: [...s.current.manualRemoved, text],
      },
    }));
    await get().persist();
  },

  finalize: async () => {
    set((s) => ({ current: { ...s.current, estado: ESTADO.PENDIENTE } }));
    await get().persist();
    return get().current;
  },

  reset: () => set({ current: emptyEval() }),
}));
