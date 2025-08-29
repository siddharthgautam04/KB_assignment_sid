// src/controllers/bookings.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../db/client';
import { BookingCreateSchema, BookingUpdateSchema } from '../schemas/booking.schema';

// small helpers
const toDateOrUndefined = (s?: string) => {
  if (!s) return undefined;
  const t = Date.parse(s);
  return Number.isNaN(t) ? undefined : new Date(t);
};

export const BookingsController = {
  
  listAll: async (req: Request, res: Response) => {
    const { resourceId, userId, from, to } = req.query as {
      resourceId?: string;
      userId?: string;
      from?: string;
      to?: string;
    };

    const fromDate = toDateOrUndefined(from);
    const toDate = toDateOrUndefined(to);
    const overlapFilter =
      fromDate && toDate
        ? {
            NOT: [{ end: { lte: fromDate } }, { start: { gte: toDate } }],
          }
        : fromDate
        ? { end: { gt: fromDate } }
        : toDate
        ? { start: { lt: toDate } }
        : undefined;

    const where = {
      ...(resourceId ? { resourceId } : {}),
      ...(userId ? { userId } : {}),
      ...(overlapFilter ? overlapFilter : {}),
    };

    const rows = await prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, employeeId: true } },
        resource: { select: { id: true, name: true } },
      },
      orderBy: { start: 'asc' },
    });

    res.json(rows);
  },

  // ─────────────────────────────────────────────────────────────────────────────

  listByResource: async (req: Request, res: Response) => {
    const resourceId = req.params.resourceId;
    const rows = await prisma.booking.findMany({
      where: { resourceId },
      include: { user: { select: { id: true, name: true, employeeId: true } } },
      orderBy: { start: 'asc' },
    });
    res.json(rows);
  },

  create: async (req: Request, res: Response) => {
    const user = (req as any).user as { id: string };
    const parsed = BookingCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { resourceId, start, end, purpose } = parsed.data;

    try {
      const conflicts = await prisma.booking.count({
        where: {
          resourceId,
          AND: [{ start: { lt: end } }, { end: { gt: start } }],
        },
      });
      if (conflicts > 0) return res.status(409).json({ error: 'Time slot already booked' });

      const created = await prisma.booking.create({
        data: { resourceId, userId: user.id, start, end, purpose },
      });
      res.status(201).json(created);
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: 'Invalid booking' });
    }
  },

  update: async (req: Request, res: Response) => {
    const id = req.params.id;
    const parsed = BookingUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      const existing = await prisma.booking.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: 'Not found' });

      const start = parsed.data.start ?? existing.start;
      const end = parsed.data.end ?? existing.end;

      const conflicts = await prisma.booking.count({
        where: {
          resourceId: existing.resourceId,
          id: { not: id },
          AND: [{ start: { lt: end } }, { end: { gt: start } }],
        },
      });
      if (conflicts > 0) return res.status(409).json({ error: 'Time slot already booked' });

      const updated = await prisma.booking.update({
        where: { id },
        data: { start, end, purpose: parsed.data.purpose ?? existing.purpose },
      });
      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: 'Invalid booking' });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      await prisma.booking.delete({ where: { id: req.params.id } });
      res.json({ ok: true });
    } catch {
      res.status(404).json({ error: 'Not found' });
    }
  },
};