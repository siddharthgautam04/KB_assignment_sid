import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export type JwtUser = { id: string; role: 'USER'|'ADMIN'; name: string; employeeId?: string|null; username?: string|null };

function fromAuthHeader(req: Request): JwtUser | undefined {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return undefined;
  try { return jwt.verify(token, process.env.JWT_SECRET!) as JwtUser; }
  catch { return undefined; }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const u = fromAuthHeader(req);
  if (!u) return res.status(401).json({ error: 'Unauthorized' });
  (req as any).user = u;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const u = (req as any).user as JwtUser | undefined || fromAuthHeader(req);
  if (!u) return res.status(401).json({ error: 'Unauthorized' });
  if (u.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  (req as any).user = u;
  next();
}