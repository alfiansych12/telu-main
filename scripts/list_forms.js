const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const forms = await prisma.registrationForm.findMany({
            select: { title: true, slug: true }
        });
        console.log('Existing Forms:', forms);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
