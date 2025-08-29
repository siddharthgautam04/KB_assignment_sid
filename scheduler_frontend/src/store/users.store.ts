// src/store/user.store.ts (or src/store/users.store.ts if you keep the same name)
import { create } from 'zustand';
import type { User } from '../types';

type UsersStore = {
  /** In-memory cache of users (not authoritative; backend owns truth) */
  users: User[];

  /** Replace the cache (e.g., after loading from an API in the future) */
  setUsers: (users: User[]) => void;

  /** Legacy helper: ensure a user exists in the cache.
   * NOTE: This does NOT create a user in the backend.
   * For real persistence, call authService.userSignup().
   */
  ensureUser: (employeeId: string, name: string) => User;

  /** Convenience finders */
  findById: (id: string) => User | undefined;

  /** Clear cache */
  clear: () => void;
};

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],

  setUsers: (users) => set({ users }),

  ensureUser: (employeeId: string, name: string) => {
    // Try to find by employeeId
    const existing = get().users.find(u => u.employeeId === employeeId);
    if (existing) {
      // Update name in cache if changed
      if (existing.name !== name) {
        const updated = { ...existing, name };
        set({ users: get().users.map(u => (u.id === existing.id ? updated : u)) });
        return updated;
      }
      return existing;
    }

    // Create a transient cache entry (NOT persisted to backend)
    const newUser: User = {
      id: crypto.randomUUID(),
      employeeId,
      name,
      role: 'USER', // uppercase to match backend
    };
    set({ users: [...get().users, newUser] });
    return newUser;
  },

  findById: (id) => get().users.find(u => u.id === id),

  clear: () => set({ users: [] }),
}));