
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const units = await prisma.unit.findMany();
    console.log('Units:', JSON.stringify(units, null, 2));

    const users = await prisma.user.findMany();
    console.log('All Users:', JSON.stringify(users, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
