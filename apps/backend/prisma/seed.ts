import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Super Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@birhanegenet.org' },
    update: {},
    create: {
      email: 'admin@birhanegenet.org',
      passwordHash: adminPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Admin created: ${admin.email} / admin123`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
