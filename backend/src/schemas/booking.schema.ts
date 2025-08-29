import { z } from 'zod';

const IdSchema = z.union([z.string().uuid(), z.string().cuid()]); // accept both

export const BookingCreateSchema = z.object({
  resourceId: IdSchema,
  start: z.coerce.date(),
  end: z.coerce.date(),
  purpose: z.string().max(200).optional()
}).refine(v => v.end > v.start, { path: ['end'], message: 'end must be after start' });

export const BookingUpdateSchema = z.object({
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),
  purpose: z.string().max(200).optional()
}).refine(v => (v.start && v.end ? v.end > v.start : true), {
  message: 'end must be after start',
  path: ['end']
});