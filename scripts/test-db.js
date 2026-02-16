const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking database connection & schema...');

        // Check if RegistrationForm table exists and count records
        const formsCount = await prisma.registrationForm.count();
        console.log('RegistrationForm table accessible. Record count:', formsCount);

        // Check if RegistrationSubmission table exists
        const submissionsCount = await prisma.registrationSubmission.count();
        console.log('RegistrationSubmission table accessible. Record count:', submissionsCount);

        console.log('Database seems OK!');
    } catch (e) {
        console.error('Database Check Failed:', e.message);
        if (e.code === 'P2021') {
            console.error('Hint: Table does not exist. Run "npx prisma db push" to create it.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
