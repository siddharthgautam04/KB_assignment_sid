// src/controllers/resources.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../db/client';
import { ResourceCreateSchema, ResourceUpdateSchema } from '../schemas/resource.schema';
import { pingOnce } from '../utils/ping';

export const ResourcesController = {
  list: async (req: Request, res: Response) => {
    const q = (req.query.q as string | undefined)?.trim();
    const where =
      q && q.length > 0
        ? {
            OR: [
              { name: { contains: q } }, 
              { ip: { contains: q } },
            ],
          }
        : undefined;

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(resources);
  },

  get: async (req: Request, res: Response) => {
    const r = await prisma.resource.findUnique({ where: { id: req.params.id } });
    if (!r) return res.status(404).json({ error: 'Not found' });
    res.json(r);
  },

  create: async (req: Request, res: Response) => {
    const parsed = ResourceCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      const r = await prisma.resource.create({ data: parsed.data });
      res.status(201).json(r);
    } catch (e: any) {
      if (e?.code === 'P2002') return res.status(409).json({ error: 'IP must be unique' });
      res.status(400).json({ error: 'Invalid' });
    }
  },

  update: async (req: Request, res: Response) => {
    const parsed = ResourceUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      const r = await prisma.resource.update({ where: { id: req.params.id }, data: parsed.data });
      res.json(r);
    } catch (e: any) {
      if (e?.code === 'P2002') return res.status(409).json({ error: 'IP must be unique' });
      res.status(404).json({ error: 'Not found' });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      await prisma.resource.delete({ where: { id: req.params.id } });
      res.json({ ok: true });
    } catch {
      res.status(404).json({ error: 'Not found' });
    }
  },

  ping: async (req: Request, res: Response) => {
    const r = await prisma.resource.findUnique({ where: { id: req.params.id } });
    if (!r) return res.status(404).json({ error: 'Not found' });
    const result = await pingOnce(r.ip);
    res.json({ ip: r.ip, ...result });
  },
};