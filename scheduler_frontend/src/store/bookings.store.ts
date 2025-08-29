
import { create } from 'zustand';
import type { Booking } from '@/types';
import { bookingsService } from '@/services/bookings.service';

type BookingsStore = {
  bookings: Booking[];

  loadAll: () => Promise<void>;

  loadResourceBookings: (resourceId: string) => Promise<void>;

  addBooking: (booking: { resourceId: string; start: string; end: string; purpose?: string }) => Promise<boolean>;

  updateBooking: (id: string, patch: Partial<Pick<Booking, 'start' | 'end' | 'purpose'>>) => Promise<boolean>;

  deleteBooking: (id: string) => Promise<void>;

  getResourceBookings: (resourceId: string) => Booking[];

  checkConflict: (resourceId: string, startISO: string, endISO: string, excludeBookingId?: string) => boolean;
};

const sortByStartAsc = (rows: Booking[]) =>
  [...rows].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

export const useBookingsStore = create<BookingsStore>((set, get) => ({
  bookings: [],

  loadAll: async () => {
    const rows = await bookingsService.listAll();
    set({ bookings: sortByStartAsc(rows) });
  },

  loadResourceBookings: async (resourceId: string) => {
    const rows = await bookingsService.listByResource(resourceId);
    const others = get().bookings.filter(b => b.resourceId !== resourceId);
    set({ bookings: sortByStartAsc([...others, ...rows]) });
  },

  addBooking: async ({ resourceId, start, end, purpose }) => {
    // quick local conflict check
    if (get().checkConflict(resourceId, start, end)) return false;

    try {
      const created = await bookingsService.create({ resourceId, start, end, purpose });
      set({ bookings: sortByStartAsc([...get().bookings, created]) });
      return true;
    } catch {
      // 409 or any failure
      return false;
    }
  },

  updateBooking: async (id, patch) => {
    const existing = get().bookings.find(b => b.id === id);
    if (!existing) return false;

    const start = patch.start ?? existing.start;
    const end = patch.end ?? existing.end;

    if (get().checkConflict(existing.resourceId, start, end, id)) return false;

    try {
      const updated = await bookingsService.update(id, patch);
      set({
        bookings: sortByStartAsc(
          get().bookings.map(b => (b.id === id ? updated : b))
        ),
      });
      return true;
    } catch {
      return false;
    }
  },

  deleteBooking: async (id) => {
    await bookingsService.remove(id);
    set({ bookings: get().bookings.filter(b => b.id !== id) });
  },

  getResourceBookings: (resourceId: string) => {
    return sortByStartAsc(get().bookings.filter(b => b.resourceId === resourceId));
  },

  checkConflict: (resourceId, startISO, endISO, excludeBookingId) => {
    const newStart = new Date(startISO);
    const newEnd = new Date(endISO);
    if (Number.isNaN(+newStart) || Number.isNaN(+newEnd) || newEnd <= newStart) return true; // invalid range is a "conflict"

    return get()
      .bookings
      .filter(b => b.resourceId === resourceId && b.id !== excludeBookingId)
      .some(b => {
        const s = new Date(b.start);
        const e = new Date(b.end);
        // overlap if NOT (newEnd <= s || newStart >= e)
        return !(newEnd <= s || newStart >= e);
      });
  },
}));