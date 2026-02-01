import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Units
    const unitIT = await prisma.unit.upsert({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000001',
            name: 'Information Technology',
            department: 'Digital Transformation',
            status: 'active',
        },
    });

    await prisma.unit.upsert({
        where: { id: '00000000-0000-0000-0000-000000000002' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000002',
            name: 'Human Resources',
            department: 'People & Culture',
            status: 'active',
        },
    });

    // 2. Create Admin User
    await prisma.user.upsert({
        where: { email: 'admin@telkomuniversity.ac.id' },
        update: {},
        create: {
            email: 'admin@telkomuniversity.ac.id',
            name: 'Super Admin',
            password: 'admin123',
            role: 'admin',
            status: 'active',
        },
    });

    // 3. Create Supervisor
    const supervisor = await prisma.user.upsert({
        where: { email: 'supervisor@telkomuniversity.ac.id' },
        update: {},
        create: {
            email: 'supervisor@telkomuniversity.ac.id',
            name: 'Budi Supervisor',
            password: 'password123',
            role: 'supervisor',
            status: 'active',
            unit_id: unitIT.id,
        },
    });

    // 4. Create Participants
    await prisma.user.upsert({
        where: { email: 'participant@telkomuniversity.ac.id' },
        update: {},
        create: {
            email: 'participant@telkomuniversity.ac.id',
            name: 'Ani Participant',
            password: 'password123',
            role: 'participant',
            status: 'active',
            unit_id: unitIT.id,
            supervisor_id: supervisor.id,
        },
    });

    await prisma.user.upsert({
        where: { email: 'hanifan@telkomuniversity.ac.id' },
        update: {},
        create: {
            email: 'hanifan@telkomuniversity.ac.id',
            name: 'Hanifan Suhardi',
            password: 'hanifan123',
            role: 'participant',
            status: 'active',
            unit_id: unitIT.id,
            supervisor_id: supervisor.id,
            internship_start: new Date('2026-01-06'),
            internship_end: new Date('2026-01-23'),
        },
    });

    console.log('✅ Seeding completed!');
    console.log('Use these credentials to login:');
    console.log('- Email: admin@telkomuniversity.ac.id | Pass: admin123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
