/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '../../generated/prisma';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config(); // Load .env values

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'elizabethnyanchama04@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      // Update admin user if exists
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      verificationCode: null,
    },
    create: {
      name: 'Lizet',
      email,
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true, // Admin users are pre-verified
      verificationCode: null,
    },
  });

  // Create some sample drivers in the Driver table
  const drivers = [
    {
      name: 'John Driver',
      email: 'driver1@sendly.com',
      password: await bcrypt.hash('driver123', 10),
      phone: '+254700000001',
      status: 'active',
    },
    {
      name: 'Jane Driver',
      email: 'driver2@sendly.com',
      password: await bcrypt.hash('driver123', 10),
      phone: '+254700000002',
      status: 'active',
    },
    {
      name: 'leeyz Driver',
      email: 'letsy799@gmail.com',
      password: await bcrypt.hash('driver123', 10),
      phone: '+254700000003',
      status: 'active',
    },
    {
      name: 'Jed Driver',
      email: 'driver4@sendly.com',
      password: await bcrypt.hash('driver123', 10),
      phone: '+254700000004',
      status: 'active',
    },
  ];

  for (const driver of drivers) {
    await prisma.driver.upsert({
      where: { email: driver.email },
      update: {
        password: driver.password,
        status: driver.status,
        phone: driver.phone,
      },
      create: driver,
    });
  }

  console.log('✅ Admin user seeded successfully!');
  console.log(`📧 Admin Email: ${email}`);
  console.log(`🔑 Admin Password: ${password}`);
  console.log('🚗 Sample drivers created in Driver table:');
  console.log('   Drivers can login at /login with:');
  drivers.forEach(driver => {
    console.log(`   - ${driver.name} (${driver.email}) - Password: driver123`);
  });
  console.log('   Note: Drivers are pre-verified and can login immediately!');
}

main()
  .catch((e) => console.error(e))
  .finally(() => {
    prisma.$disconnect();
  });
