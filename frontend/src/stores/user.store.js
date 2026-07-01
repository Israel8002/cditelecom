import { create } from 'zustand';
import { getUser, saveUser } from '../services/storage.service';

export const useUserStore = create((set) => ({
  user: null,
  loaded: false,
  load: async () => {
    const user = await getUser();
    set({ user, loaded: true });
    return user;
  },
  save: async (data) => {
    const user = await saveUser(data);
    set({ user });
    return user;
  },
}));
