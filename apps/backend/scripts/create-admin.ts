import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking for admin user...');

  const existing = await prisma.user.findUnique({
    where: { email: 'admin@birhanegenet.org' },
  });

  if (existing) {
    console.log('✅ Admin user already exists:', existing.email);
    return;
  }

  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@birhanegenet.org',
      passwordHash: adminPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log(`📧 Email: ${admin.email}`);
  console.log(`🔑 Password: admin123`);
  console.log(`🆔 ID: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
