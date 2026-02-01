
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    console.log(`Checking attendances between ${today.toISOString()} and ${tomorrow.toISOString()}`);

    const attendances = await prisma.attendance.findMany({
        where: {
            date: {
                gte: today,
                lt: tomorrow
            }
        },
        include: {
            user: true
        }
    });

    console.log(`Found ${attendances.length} records for today:`);
    attendances.forEach(a => {
        console.log(`- User: ${a.user.name}, Time: ${a.check_in_time}, Status: ${a.status}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
