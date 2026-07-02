import { create } from 'zustand';
import { getAllEquipos, getEquiposByRoom, saveEquipo, deleteEquipo } from '../services/storage.service';

export const useEquipmentStore = create((set, get) => ({
  equipos: [],
  loading: false,

  loadAll: async () => {
    set({ loading: true });
    try {
      const equipos = await getAllEquipos();
      set({ equipos, loading: false });
      return equipos;
    } catch (err) {
      set({ loading: false });
      return [];
    }
  },

  loadByRoom: async (roomId) => {
    set({ loading: true });
    try {
      const equipos = await getEquiposByRoom(roomId);
      set({ equipos, loading: false });
      return equipos;
    } catch (err) {
      set({ loading: false });
      return [];
    }
  },

  save: async (equipo) => {
    const saved = await saveEquipo(equipo);
    // Refresh local list
    const currentRoomId = equipo.roomId;
    if (currentRoomId) {
      await get().loadByRoom(currentRoomId);
    } else {
      await get().loadAll();
    }
    return saved;
  },

  delete: async (id, roomId = null) => {
    await deleteEquipo(id);
    if (roomId) {
      await get().loadByRoom(roomId);
    } else {
      await get().loadAll();
    }
  }
}));
