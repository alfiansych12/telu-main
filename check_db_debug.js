
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
    console.log("Checking users...");
    try {
        const users = await prisma.user.findMany();
        console.log("Users found:", users.length);
        users.forEach(u => {
            console.log(`- Email: ${u.email}, Password: '${u.password}', Role: ${u.role}`);
        });
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
