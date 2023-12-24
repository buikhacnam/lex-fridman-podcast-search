import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Role
  await prisma.$executeRaw`insert into Role (id, name, created_at, updated_at)
  values (1, 'ADMIN', NOW(), NOW()),
  (2, 'USER', NOW(), NOW());`;

  // Permission
  await prisma.$executeRaw`insert into Permission (id, name, created_at, updated_at)
  values (1, 'GENERAL_ADMIN_PERMISSION', NOW(), NOW()),
  (2, 'GENERAL_USER_PERMISSION', NOW(), NOW()),
  (3, 'BLOCK_USER', NOW(), NOW());`;

  // _PermissionToRole
  await prisma.$executeRaw`insert into _PermissionToRole (B, A)
  values 
  (1,1),
  (1,2),
  (1,3),
  (2,2);`;
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
