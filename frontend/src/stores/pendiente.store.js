import { create } from 'zustand';
import { getAllPendientes, getPendientesByUnit, savePendiente, syncPendientesFromEvaluations } from '../services/storage.service';

export const usePendienteStore = create((set, get) => ({
  pendientes: [],
  loading: false,

  loadAll: async () => {
    set({ loading: true });
    try {
      const list = await getAllPendientes();
      set({ pendientes: list, loading: false });
      return list;
    } catch (err) {
      set({ loading: false });
      return [];
    }
  },

  loadByUnit: async (unitId) => {
    set({ loading: true });
    try {
      const list = await getPendientesByUnit(unitId);
      set({ pendientes: list, loading: false });
      return list;
    } catch (err) {
      set({ loading: false });
      return [];
    }
  },

  sync: async () => {
    set({ loading: true });
    try {
      await syncPendientesFromEvaluations();
      const list = await getAllPendientes();
      set({ pendientes: list, loading: false });
      return list;
    } catch (err) {
      set({ loading: false });
      return [];
    }
  },

  resolve: async (id, comment) => {
    set({ loading: true });
    try {
      // Find within local store or fetch from DB
      let list = get().pendientes;
      let item = list.find((p) => p.id === id);
      
      if (!item) {
        // Fallback search in all db items if not present in current filtered list
        const allItems = await getAllPendientes();
        item = allItems.find((p) => p.id === id);
        list = allItems;
      }

      if (item) {
        const updated = {
          ...item,
          resolved: true,
          resolvedAt: new Date().toISOString(),
          resolutionComment: comment,
        };
        await savePendiente(updated);
        
        // Refresh local list
        const updatedList = list.map((p) => (p.id === id ? updated : p));
        set({ pendientes: updatedList, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      set({ loading: false });
    }
  },
}));
