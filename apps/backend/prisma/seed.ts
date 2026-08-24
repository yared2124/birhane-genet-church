import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Create database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

// Instantiate PrismaClient with the adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding admin user...');

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@birhanegenet.org' },
  });

  if (existing) {
    console.log('✅ Admin user already exists:', existing.email);
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@birhanegenet.org',
      passwordHash: hashedPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ Admin user created successfully!`);
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
    await pool.end();
  });
