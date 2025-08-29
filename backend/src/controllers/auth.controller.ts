import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/client';
import { AdminLoginSchema, AdminSignupSchema, UserLoginSchema, UserSignupSchema } from '../schemas/auth.schema';

function sign(payload: { id: string; role: 'USER'|'ADMIN'; name: string; employeeId?: string|null; username?: string|null }) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '8h' });
}

export const AuthController = {
  userSignup: async (req: Request, res: Response) => {
    const parsed = UserSignupSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { employeeId, name, username } = parsed.data;

    try {
      let user = await prisma.user.findFirst({ where: { OR: [{ employeeId }, { username }] } });
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name, role: 'USER' }
        });
        const token = sign({ id: user.id, role: user.role, name: user.name, employeeId: user.employeeId ?? null, username: user.username ?? null });
        return res.status(200).json({ token, user: { id: user.id, name: user.name, employeeId: user.employeeId, role: user.role } });
      }

      const created = await prisma.user.create({
        data: { employeeId, name, username: username ?? null, role: 'USER' }
      });
      const token = sign({ id: created.id, role: created.role, name: created.name, employeeId: created.employeeId ?? null, username: created.username ?? null });
      res.status(201).json({ token, user: { id: created.id, name: created.name, employeeId: created.employeeId, role: created.role } });
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: 'Could not sign up' });
    }
  },

userLogin: async (req: Request, res: Response) => {
    const parsed = UserLoginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { employeeId, username } = parsed.data;
  
    if (!employeeId && !username) {
      return res.status(400).json({ error: 'Provide employeeId or username' });
    }
  
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          employeeId ? { employeeId } : undefined,
          username ? { username } : undefined
        ].filter(Boolean) as any
      }
    });
  
    if (!user || user.role !== 'USER') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  
    const token = sign({
      id: user.id,
      role: user.role,
      name: user.name,
      employeeId: user.employeeId ?? null,
      username: user.username ?? null
    });
  
    res.json({
      token,
      user: { id: user.id, role: user.role, name: user.name, employeeId: user.employeeId }
    });
  },

  adminSignup: async (req: Request, res: Response) => {
    const parsed = AdminSignupSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { name, username, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(409).json({ error: 'Username already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await prisma.user.create({
      data: { name, username, passwordHash, role: 'ADMIN' }
    });

    const token = sign({ id: admin.id, role: admin.role, name: admin.name, username: admin.username ?? null });
    res.status(201).json({ token, user: { id: admin.id, role: admin.role, name: admin.name, username: admin.username } });
  },

  adminLogin: async (req: Request, res: Response) => {
    const parsed = AdminLoginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { username, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.role !== 'ADMIN' || !user.passwordHash)
      return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = sign({ id: user.id, role: user.role, name: user.name, username: user.username ?? null });
    res.json({ token, user: { id: user.id, role: user.role, name: user.name, username: user.username } });
  }
};