import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  apply: () => void;
}

function applyToDocument(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggle: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        applyToDocument(next);
        set({ theme: next });
      },
      apply: () => applyToDocument(get().theme),
    }),
    { name: 'ticketbus-theme' },
  ),
);
