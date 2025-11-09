/**
 * Auth Store (Zustand)
 *
 * Global state management for user authentication and session.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '@/types';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setSession: (session) => {
        set({ session });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      logout: async () => {
        try {
          // Call logout API
          await fetch('/api/auth/logout', {
            method: 'POST',
          });

          // Clear state
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          });

          // Redirect to home
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        } catch (error) {
          console.error('Logout failed:', error);
        }
      },

      initialize: async () => {
        try {
          set({ isLoading: true });

          // Check session
          const response = await fetch('/api/auth/session');

          if (response.ok) {
            const data = await response.json();

            if (data.user) {
              set({
                user: data.user,
                session: data.session,
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              set({
                user: null,
                session: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
