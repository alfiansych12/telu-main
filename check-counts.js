const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.count();
    const attendances = await prisma.attendance.count();
    const notifications = await prisma.userNotification.count();
    console.log({ users, attendances, notifications });
    await prisma.$disconnect();
}
main();
