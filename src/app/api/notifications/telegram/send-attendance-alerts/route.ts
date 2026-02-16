import { NextRequest, NextResponse } from 'next/server';
import { getAbsentInternsGroupedBySupervisor } from '@/utils/queries/attendance-check';
import { sendTelegramNotification, formatAttendanceNotificationMessage } from '@/utils/api/telegram';
import prisma from 'lib/prisma';
import { getserverAuthSession } from 'utils/authOptions';

/**
 * API Endpoint untuk mengirim notifikasi Telegram ke supervisor
 * tentang anak magang yang tidak presensi
 * 
 * POST /api/notifications/telegram/send-attendance-alerts
 */
export async function POST(request: NextRequest) {
    try {
        // Verifikasi authentication - hanya admin yang bisa trigger
        const session = await getserverAuthSession();
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        // Ambil data anak magang yang tidak presensi, dikelompokkan per supervisor
        const groupedAbsentInterns = await getAbsentInternsGroupedBySupervisor();

        if (groupedAbsentInterns.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Semua anak magang sudah presensi hari ini!',
                sent: 0,
                failed: 0
            });
        }

        // Kirim notifikasi ke setiap supervisor
        const results = [];
        let sentCount = 0;
        let failedCount = 0;

        for (const group of groupedAbsentInterns) {
            // Ambil telegram_username dari database
            const supervisor = await prisma.user.findUnique({
                where: { id: group.supervisor_id },
                select: { telegram_username: true }
            });

            if (!supervisor || !supervisor.telegram_username) {
                console.warn(`Supervisor ${group.supervisor_email} tidak memiliki telegram_username`);
                results.push({
                    supervisor: group.supervisor_email,
                    telegram_username: 'TIDAK TERDAFTAR',
                    absent_count: group.absent_interns.length,
                    success: false,
                    error: 'Telegram username tidak terdaftar. Mohon update profile supervisor.'
                });
                failedCount++;
                continue;
            }

            // Format pesan dari template
            const { title, message } = await formatAttendanceNotificationMessage(
                group.supervisor_name,
                group.absent_interns
            );

            // Kirim notifikasi
            const telegramResult = await sendTelegramNotification({
                recipientId: supervisor.telegram_username,
                title: title,
                message: message,
                parseMode: 'HTML',
                disableNotification: false
            });

            results.push({
                supervisor: group.supervisor_email,
                telegram_username: supervisor.telegram_username,
                absent_count: group.absent_interns.length,
                success: telegramResult.success,
                error: telegramResult.error
            });

            if (telegramResult.success) {
                sentCount++;
            } else {
                failedCount++;
            }

            // Rate limiting - tunggu 500ms antar request
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return NextResponse.json({
            success: true,
            message: `Notifikasi terkirim ke ${sentCount} supervisor`,
            sent: sentCount,
            failed: failedCount,
            total_supervisors: groupedAbsentInterns.length,
            results: results
        });

    } catch (error) {
        console.error('Error sending attendance alerts:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

/**
 * GET endpoint untuk preview data yang akan dikirim
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getserverAuthSession();
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const groupedAbsentInterns = await getAbsentInternsGroupedBySupervisor();

        // Tambahkan info telegram_username untuk setiap supervisor
        const preview = await Promise.all(
            groupedAbsentInterns.map(async (group) => {
                const supervisor = await prisma.user.findUnique({
                    where: { id: group.supervisor_id },
                    select: { telegram_username: true }
                });

                const { title, message } = await formatAttendanceNotificationMessage(
                    group.supervisor_name,
                    group.absent_interns
                );

                return {
                    supervisor_name: group.supervisor_name,
                    supervisor_email: group.supervisor_email,
                    telegram_username: supervisor?.telegram_username || 'TIDAK TERDAFTAR',
                    absent_count: group.absent_interns.length,
                    absent_interns: group.absent_interns,
                    preview_title: title,
                    preview_message: message
                };
            })
        );

        return NextResponse.json({
            success: true,
            date: new Date().toISOString(),
            total_supervisors: preview.length,
            total_absent_interns: preview.reduce((sum, p) => sum + p.absent_count, 0),
            preview: preview
        });

    } catch (error) {
        console.error('Error getting preview:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
