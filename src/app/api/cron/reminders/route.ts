import { NextResponse } from 'next/server';
import prisma from 'lib/prisma';
import { createNotification } from 'utils/api/notifications';

export const dynamic = 'force-dynamic'; // Prevent static caching

export async function GET(request: Request) {
    try {
        // 1. Basic validation (optional: add secret key check for security)
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        const CRON_SECRET = process.env.CRON_SECRET || 'default_secret_dev';

        if (secret !== CRON_SECRET) {
            // Allow execution in dev even without secret if needed, or enforce it. 
            // For now, we'll just log a warning if it doesn't match but proceed if valid in dev.
            if (process.env.NODE_ENV !== 'development') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        // 2. Determine date range for "Today"
        const now = new Date();
        // Check if it's a weekend (Saturday=6, Sunday=0)
        const day = now.getDay();
        if (day === 0 || day === 6) {
            return NextResponse.json({ message: 'Weekend, no reminders sent.' });
        }

        // Start of day and End of day
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        // 3. Fetch active participants
        const participants = await prisma.user.findMany({
            where: {
                role: 'participant',
                status: 'active',
                deleted_at: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                personal_email: true,
            }
        });

        if (participants.length === 0) {
            return NextResponse.json({ message: 'No active participants found.' });
        }

        const results = [];

        // 4. Iterate and check status
        for (const participant of participants) {
            // Check Attendance
            const attendance = await prisma.attendance.findFirst({
                where: {
                    user_id: participant.id,
                    date: {
                        gte: startOfDay,
                        lte: endOfDay,
                    }
                }
            });

            if (attendance) {
                // Already checked in or has status
                continue;
            }

            // Check Active Leave Request
            // Find any approved leave request that covers today
            const leaveRequest = await prisma.leaveRequest.findFirst({
                where: {
                    user_id: participant.id,
                    status: 'approved',
                    start_date: { lte: now },
                    end_date: { gte: now },
                }
            });

            if (leaveRequest) {
                // Has approved leave, skip
                continue;
            }

            // 5. Send Notification (Missing Check-in)
            const message = `Halo ${participant.name}, Anda belum melakukan check-in hari ini (${now.toLocaleDateString('id-ID')}). Silakan check-in atau ajukan izin jika berhalangan.`;

            await createNotification({
                userId: participant.id,
                title: 'Pengingat Check-in',
                message: message,
                type: 'attendance',
                link: '/attendance'
            });

            // Note: createNotification inside api/notifications.ts already handles sending email to user.email
            // If we want to support personal_email, we might need to modify createNotification or send it here manually.
            // For now relying on createNotification's logic but we will enhance it in next step if needed.

            results.push({
                user: participant.name,
                status: 'Notified'
            });
        }

        return NextResponse.json({
            success: true,
            date: now.toISOString(),
            processed: participants.length,
            notifications_sent: results.length,
            details: results
        });

    } catch (error) {
        console.error('Reminder Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
