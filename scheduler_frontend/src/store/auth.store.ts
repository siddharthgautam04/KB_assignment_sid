// src/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types';
import { authService } from '@/services/auth.service';
import { LocalStorageService } from '@/services/localStorage.service';

type AuthStore = {
  user: AuthUser | null;

  bootstrap: () => void;

  loginUser: (params: { employeeId?: string; username?: string }) => Promise<boolean>;
  signupUser: (params: { name: string; employeeId: string; username?: string }) => Promise<boolean>;
  loginAdmin: (params: { username: string; password: string }) => Promise<boolean>;
  signupAdmin: (params: { name: string; username: string; password: string }) => Promise<boolean>;

  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, _get) => ({
      user: null,

      bootstrap: () => {
        authService.bootstrap();
        const u = LocalStorageService.getUser<AuthUser>();
        if (u) set({ user: u });
      },

      // --- USER AUTH ---

      async loginUser({ employeeId, username }) {
        try {
          const { user } = await authService.userLogin({ employeeId, username });
          set({ user: user as AuthUser });
          return true;
        } catch {
          return false;
        }
      },

      async signupUser({ name, employeeId, username }) {
        try {
          const { user } = await authService.userSignup({ name, employeeId, username });
          set({ user: user as AuthUser });
          return true;
        } catch {
          return false;
        }
      },

      // --- ADMIN AUTH ---

      async loginAdmin({ username, password }) {
        try {
          const { user } = await authService.adminLogin({ username, password });
          set({ user: user as AuthUser });
          return true;
        } catch {
          return false;
        }
      },

      async signupAdmin({ name, username, password }) {
        try {
          const { user } = await authService.adminSignup({ name, username, password });
          set({ user: user as AuthUser });
          return true;
        } catch {
          return false;
        }
      },

      logout: () => {
        authService.logout();                 
        set({ user: null });
      },
    }),
    {
      name: 'rbs.auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);