import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  // Admin user
  const adminPass = await bcrypt.hash('admin', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'Admin',
      username: 'admin',
      passwordHash: adminPass,
      role: 'ADMIN'
    }
  });

  // Example regular user
  const alice = await prisma.user.upsert({
    where: { employeeId: 'E1001' },
    update: { name: 'Alice' },
    create: { employeeId: 'E1001', name: 'Alice', role: 'USER' }
  });

  // Resources
  const r1 = await prisma.resource.upsert({
    where: { ip: '10.0.0.1' },
    update: { status: 'up' },
    create: { name: 'API-01', ip: '10.0.0.1', type: 'api', status: 'up' }
  });
  const r2 = await prisma.resource.upsert({
    where: { ip: '10.0.0.2' },
    update: { status: 'unknown' },
    create: { name: 'DB-01', ip: '10.0.0.2', type: 'db', status: 'unknown' }
  });

  // One sample booking
  const now = Date.now();
  await prisma.booking.create({
    data: {
      resourceId: r1.id,
      userId: alice.id,
      start: new Date(now + 60 * 60 * 1000),
      end: new Date(now + 2 * 60 * 60 * 1000),
      purpose: 'Integration test window'
    }
  });
}
main().finally(() => prisma.$disconnect());