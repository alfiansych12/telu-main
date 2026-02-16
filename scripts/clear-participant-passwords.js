const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Clearing all participant passwords in the database...');

    const result = await prisma.user.updateMany({
        where: {
            role: 'participant',
            password: { not: null }
        },
        data: {
            password: null
        }
    });

    console.log(`✅ Success! Cleared passwords for ${result.count} participants.`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
