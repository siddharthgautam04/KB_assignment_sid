import { api } from './api';
import type { Resource } from '@/types';

type CreateResourceInput = {
  name: string;
  ip: string;
  type?: string;
  status?: 'up' | 'down' | 'unknown';
  description?: string;
};

type UpdateResourceInput = Partial<CreateResourceInput>;

export const resourcesService = {
  list(q?: string) {
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    return api.get<Resource[]>(`/api/resources${qs}`);
  },

  get(id: string) {
    return api.get<Resource>(`/api/resources/${id}`);
  },

  create(body: CreateResourceInput) {
    return api.post<Resource>('/api/resources', body);
  },

  update(id: string, body: UpdateResourceInput) {
    return api.put<Resource>(`/api/resources/${id}`, body);
  },

  remove(id: string) {
    return api.del<{ ok: boolean }>(`/api/resources/${id}`);
  },

  ping(id: string) {
    return api.get<{ ip: string; reachable: boolean; ms?: number }>(
      `/api/resources/${id}/ping`
    );
  },
};