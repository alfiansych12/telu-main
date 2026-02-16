import { NextRequest, NextResponse } from 'next/server';
import prisma from 'lib/prisma';

const SETTING_KEY = 'telegram_notification_schedule';

const DEFAULT_SETTINGS = {
    check_in: {
        time: '09:00',
        enabled: true,
        target: 'participant', // default to participant as requested
        message: 'Halo! Jangan lupa untuk melakukan presensi masuk hari ini ya. Semangat!'
    },
    break: {
        time: '12:00',
        enabled: false,
        target: 'participant',
        message: 'Hai! Sudah masuk jam istirahat. Jika belum presensi, segera lakukan ya!'
    },
    check_out: {
        time: '17:00',
        enabled: true,
        target: 'participant',
        message: 'Sudah jam pulang! Pastikan Anda sudah melakukan presensi keluar (check-out) sebelum meninggalkan kantor.'
    }
};

export async function GET() {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: SETTING_KEY }
        });

        if (!setting) {
            return NextResponse.json(DEFAULT_SETTINGS);
        }

        return NextResponse.json(setting.value);
    } catch (error) {
        console.error('Error fetching telegram settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Ambil data lama dulu untuk merge (menghindari kehilangan field 'message' jika UI belum support)
        const currentRecord = await prisma.systemSetting.findUnique({
            where: { key: SETTING_KEY }
        });

        const existingValue = currentRecord ? (currentRecord.value as any) : DEFAULT_SETTINGS;

        // Merge settings
        const newValue = {
            check_in: { ...existingValue.check_in, ...body.check_in },
            break: { ...existingValue.break, ...body.break },
            check_out: { ...existingValue.check_out, ...body.check_out }
        };

        const setting = await prisma.systemSetting.upsert({
            where: { key: SETTING_KEY },
            update: {
                value: newValue,
                updated_at: new Date()
            },
            create: {
                key: SETTING_KEY,
                value: newValue,
                description: 'Jadwal notifikasi otomatis Telegram'
            }
        });

        return NextResponse.json(setting.value);
    } catch (error) {
        console.error('Error saving telegram settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
