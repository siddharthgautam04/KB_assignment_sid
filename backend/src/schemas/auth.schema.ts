import { z } from 'zod';

export const UserSignupSchema = z.object({
  name: z.string().min(1),
  employeeId: z.string().min(1),
  username: z.string().min(1).optional() 
});

export const UserLoginSchema = z.object({
  employeeId: z.string().min(1),
  username: z.string().min(1).optional() 
});

export const AdminSignupSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(6)
});

export const AdminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});