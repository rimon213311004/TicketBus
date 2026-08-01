import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isHydrated: boolean;
  setSession: (user: User, accessToken: string) => void;
  /** Refreshes the cached user without touching the token. */
  setUser: (user: User) => void;
  clearSession: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isHydrated: false,
      setSession: (user, accessToken) => set({ user, accessToken }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ user: null, accessToken: null }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'ticketbus-auth',
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
