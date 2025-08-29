import { z } from 'zod';

export const ResourceCreateSchema = z.object({
  name: z.string().min(1),
  ip: z.string().regex(/^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/, 'invalid IPv4'),
  type: z.string().optional(),
  status: z.enum(['up', 'down', 'unknown']).optional(),
  description: z.string().optional()
});

export const ResourceUpdateSchema = ResourceCreateSchema.partial();

export type ResourceCreateInput = z.infer<typeof ResourceCreateSchema>;
export type ResourceUpdateInput = z.infer<typeof ResourceUpdateSchema>;