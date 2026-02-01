import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding certificate settings...');

    await prisma.systemSetting.upsert({
        where: { key: 'certificate_settings' },
        update: {},
        create: {
            key: 'certificate_settings',
            value: {
                hr_officer_name: '[Nama Pejabat SDM]',
                hr_officer_position: 'Kepala Bagian Pengembangan SDM',
                city: 'Bandung'
            },
            description: 'Settings for HR officer on certificates'
        }
    });

    console.log('Done!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
