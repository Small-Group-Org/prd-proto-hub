import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'Admin123!';
  const firstName = process.argv[4] || 'Admin';
  const lastName = process.argv[5] || 'User';

  console.log('Creating superuser...');
  console.log('Email:', email);
  console.log('Password:', password.replace(/./g, '*'));

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.error('Error: User with this email already exists');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role: 'SUPERUSER',
      status: 'ACTIVE',
    },
  });

  console.log('\n✓ Superuser created successfully!');
  console.log('\nUser Details:');
  console.log('  ID:', user.id);
  console.log('  Email:', user.email);
  console.log('  Name:', `${user.firstName} ${user.lastName}`);
  console.log('  Role:', user.role);
  console.log('\nYou can now login with these credentials.');
}

main()
  .catch((error) => {
    console.error('Error creating superuser:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

