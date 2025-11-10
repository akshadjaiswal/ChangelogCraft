/**
 * UI Store (Zustand)
 *
 * Global state management for UI-related state (theme, modals, etc.).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  activeModal: string | null;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      activeModal: null,

      setTheme: (theme) => {
        set({ theme });

        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;

          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
            root.classList.toggle('dark', systemTheme === 'dark');
          } else {
            root.classList.toggle('dark', theme === 'dark');
          }
        }
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      openModal: (modal) => {
        set({ activeModal: modal });
      },

      closeModal: () => {
        set({ activeModal: null });
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
