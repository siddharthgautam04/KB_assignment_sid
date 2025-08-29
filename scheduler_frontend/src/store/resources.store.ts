// src/store/resources.store.ts
import { create } from 'zustand';
import type { Resource } from '@/types';
import { resourcesService } from '@/services/resources.service';

type CreateInput = {
  name: string;
  ip: string;
  type?: string;
  status?: 'up' | 'down' | 'unknown';
  description?: string;
};

type UpdateInput = Partial<{
  name: string;
  ip: string;
  type: string;
  status: 'up' | 'down' | 'unknown';
  description: string;
}>;

type ResourcesStore = {
  resources: Resource[];

  loadResources: (q?: string) => Promise<void>;

  loadResource: (id: string) => Promise<Resource | null>;

  /** Create a resource */
  addResource: (input: CreateInput) => Promise<Resource>;

  /** Update an existing resource */
  updateResource: (id: string, patch: UpdateInput) => Promise<Resource>;

  /** Delete a resource */
  deleteResource: (id: string) => Promise<void>;

  /** Read helper from cache */
  getResource: (id: string) => Resource | undefined;
};

export const useResourcesStore = create<ResourcesStore>((set, get) => ({
  resources: [],

  loadResources: async (q?: string) => {
    const rows = await resourcesService.list(q);
    set({ resources: rows });
  },

  loadResource: async (id: string) => {
    try {
      const r = await resourcesService.get(id);
      // Merge/insert into cache
      const exists = get().resources.some(x => x.id === id);
      set({
        resources: exists
          ? get().resources.map(x => (x.id === id ? r : x))
          : [...get().resources, r],
      });
      return r;
    } catch {
      // keep cache unchanged on 404/etc.
      return null;
    }
  },

  addResource: async (input) => {
    const created = await resourcesService.create(input);
    // Option 1: append then refresh full list (ensures server truth)
    set({ resources: [...get().resources, created] });
    // Re-sync list to capture server-side defaults/indices/etc.
    try {
      const rows = await resourcesService.list();
      set({ resources: rows });
    } catch {
      /* ignore; keep optimistic state */
    }
    return created;
  },

  updateResource: async (id, patch) => {
    const updated = await resourcesService.update(id, patch);
    set({ resources: get().resources.map(r => (r.id === id ? updated : r)) });
    // Optional re-sync (useful if other fields are server-calculated)
    try {
      const fresh = await resourcesService.get(id);
      set({ resources: get().resources.map(r => (r.id === id ? fresh : r)) });
    } catch {
      /* ignore */
    }
    return updated;
  },

  deleteResource: async (id) => {
    await resourcesService.remove(id);
    set({ resources: get().resources.filter(r => r.id !== id) });
    // Optional re-sync everything (in case of cascading effects)
    try {
      const rows = await resourcesService.list();
      set({ resources: rows });
    } catch {
      /* ignore */
    }
  },

  getResource: (id) => get().resources.find(r => r.id === id),
}));