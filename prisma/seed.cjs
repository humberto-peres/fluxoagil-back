const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const exists = await prisma.user.findUnique({ where: { username } });
  if (!exists) {
    const hash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email,
        username,
        password: hash,
        role: 'admin',
      },
    });
    console.log('Admin seed criado:', username);
  } else {
    console.log('Admin já existe, seed pulado.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
