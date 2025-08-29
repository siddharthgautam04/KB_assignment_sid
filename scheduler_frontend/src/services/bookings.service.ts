// src/services/bookings.service.ts
import { api } from './api';
import type { Booking } from '@/types';

type CreateBookingInput = {
  resourceId: string;
  start: string; 
  end: string;   
  purpose?: string;
};

type UpdateBookingInput = Partial<Pick<Booking, 'start' | 'end' | 'purpose'>>;

export const bookingsService = {
  listByResource(resourceId: string) {
    return api.get<Booking[]>(`/api/bookings/resource/${resourceId}`);
  },

  listAll(params?: {
    resourceId?: string;
    userId?: string;
    from?: string;  
    to?: string;    
    page?: number;
    limit?: number;
  }) {
    const qs = new URLSearchParams();
    if (params?.resourceId) qs.set('resourceId', params.resourceId);
    if (params?.userId) qs.set('userId', params.userId);
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return api.get<Booking[]>(`/api/bookings${q ? `?${q}` : ''}`);
  },

  create(body: CreateBookingInput) {
    return api.post<Booking>('/api/bookings', body);
  },

  update(id: string, body: UpdateBookingInput) {
    return api.put<Booking>(`/api/bookings/${id}`, body);
  },

  remove(id: string) {
    return api.del<{ ok: true }>(`/api/bookings/${id}`);
  },
};