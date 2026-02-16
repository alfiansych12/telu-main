import { NextRequest, NextResponse } from 'next/server';
import { getAbsentInternsGroupedBySupervisor } from '@/utils/queries/attendance-check';
import { sendTelegramNotification } from '@/utils/api/telegram';
import prisma from 'lib/prisma';
import fs from 'fs';
import path from 'path';
import { toZonedTime, format } from 'date-fns-tz';

function debugLog(message: string) {
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const logMessage = `[${timestamp}] ${message}\n`;
    try {
        const logDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
        fs.appendFileSync(path.join(logDir, 'cron-debug.log'), logMessage);
    } catch (err) {
        console.error('Failed to write log:', err);
    }
}

export const dynamic = 'force-dynamic';

/**
 * Cron Job untuk mengirim notifikasi otomatis
 * Endpoint ini dipanggil oleh cron scheduler (misal: Vercel Cron, GitHub Actions, dll)
 * 
 * GET /api/cron/attendance-reminder
 * 
 * Untuk keamanan, gunakan secret token di header:
 * Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET || 'default-secret-change-me';

        // Log untuk keperluan debug
        const ip = request.ip || 'unknown';

        // Di lokal, kita izinkan tanpa token jika dari localhost untuk mempermudah tes
        const isLocal = ip === '127.0.0.1' || ip === '::1';

        if (authHeader !== `Bearer ${cronSecret}` && !isLocal) {
            console.warn(`[CRON] Unauthorized access attempt from IP: ${ip}`);
            return NextResponse.json({
                error: 'Unauthorized',
                message: 'Silakan gunakan Bearer token atau akses dari localhost'
            }, { status: 401 });
        }

        // Cek apakah hari ini hari kerja (Senin-Jumat)
        const tz = 'Asia/Jakarta';
        const now = new Date();
        const jakartaTime = toZonedTime(now, tz);

        const dayOfWeek = jakartaTime.getDay();
        const currentHHmm = format(jakartaTime, 'HH:mm', { timeZone: tz });

        console.log(`[CRON] Heartbeat at ${currentHHmm} Jakarta Time (Day: ${dayOfWeek})`);
        debugLog(`Heartbeat at ${currentHHmm} (Day: ${dayOfWeek})`);

        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return NextResponse.json({ success: true, message: 'Skipped - Weekend' });
        }

        // Ambil pengaturan dari database
        const settingsRecord = await prisma.systemSetting.findUnique({
            where: { key: 'telegram_notification_schedule' }
        });

        if (!settingsRecord) {
            console.log('[CRON] No settings record found in database (key: telegram_notification_schedule)');
            return NextResponse.json({ success: true, message: 'No settings configured' });
        }

        const settings = settingsRecord.value as any;
        console.log('[CRON] Settings retrieved:', JSON.stringify(settings));

        // Tentukan task mana yang harus dijalankan
        let queryType: 'check_in' | 'check_out' | null = null;
        let scheduleKey: 'check_in' | 'break' | 'check_out' | null = null;

        if (settings.check_in?.enabled && settings.check_in.time === currentHHmm) {
            queryType = 'check_in';
            scheduleKey = 'check_in';
        } else if (settings.break?.enabled && settings.break.time === currentHHmm) {
            // Untuk break, kita asumsikan ini pengingat kedua untuk check-in
            queryType = 'check_in';
            scheduleKey = 'break';
        } else if (settings.check_out?.enabled && settings.check_out.time === currentHHmm) {
            queryType = 'check_out';
            scheduleKey = 'check_out';
        }

        if (!queryType || !scheduleKey) {
            console.log(`[CRON] No task scheduled for ${currentHHmm}. Comparison: Check-in(${settings.check_in?.time}), Break(${settings.break?.time}), Check-out(${settings.check_out?.time})`);
            debugLog(`No task for ${currentHHmm}. Settings: IN=${settings.check_in?.time}(${settings.check_in?.enabled}), BREAK=${settings.break?.time}(${settings.break?.enabled}), OUT=${settings.check_out?.time}(${settings.check_out?.enabled})`);
            return NextResponse.json({ success: true, message: `No task scheduled for ${currentHHmm}` });
        }

        const customMessage = settings[scheduleKey].message;
        const target = settings[scheduleKey].target || 'supervisor';

        console.log(`[CRON] Task triggered: ${scheduleKey} (query: ${queryType}) targeting ${target}`);

        // Ambil data sesuai tipe
        const groupedAbsentInterns = await getAbsentInternsGroupedBySupervisor(queryType);
        console.log(`[CRON] Found ${groupedAbsentInterns.length} groups for notification via ${scheduleKey}`);

        if (groupedAbsentInterns.length === 0) {
            debugLog(`No absent interns found for ${scheduleKey}`);
            return NextResponse.json({ success: true, message: 'No absent interns found for this task', sent: 0 });
        }

        console.log(`[CRON] Processing notifications for target: ${target}`);

        // Kirim notifikasi
        let sentCount = 0;
        let failedCount = 0;

        // Tentukan judul berdasarkan scheduleKey
        let notificationTitle = '🔔 Reminder: Presensi Magang';
        if (scheduleKey === 'check_in') notificationTitle = '🔔 Reminder: Presensi Masuk';
        else if (scheduleKey === 'break') notificationTitle = '🔔 Reminder: Istirahat';
        else if (scheduleKey === 'check_out') notificationTitle = '🔔 Reminder: Presensi Keluar';

        if (target === 'participant') {
            // KIRIM KE ANAK MAGANG (PARTICIPANT)
            for (const group of groupedAbsentInterns) {
                for (const intern of group.absent_interns) {
                    const userData = await prisma.user.findUnique({
                        where: { id: intern.intern_id },
                        select: { telegram_username: true, name: true } as any
                    }) as any;

                    if (!userData?.telegram_username) {
                        const skipMsg = `[CRON] Intern ${intern.intern_name} has no telegram_username/ChatID`;
                        console.log(skipMsg);
                        debugLog(skipMsg);
                        continue;
                    }

                    const title = notificationTitle;
                    const message = `
<b>${title}</b>

Halo <b>${userData.name}</b>,

${customMessage}

<i>Silakan segera melakukan presensi melalui Internship Management System.</i>

⏰ Waktu: ${jakartaTime.toLocaleString('id-ID')}
                    `.trim();

                    console.log(`[CRON] Sending to intern: ${userData.telegram_username} (${userData.name})`);
                    const telegramResult = await sendTelegramNotification({
                        recipientId: userData.telegram_username,
                        title: title,
                        message: message,
                        parseMode: 'HTML'
                    });

                    if (telegramResult.success) sentCount++;
                    else {
                        failedCount++;
                        console.error(`[CRON] Failed to send to ${userData.telegram_username}:`, telegramResult.error);
                    }

                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
        } else {
            // KIRIM KE SUPERVISOR (VIC)
            for (const group of groupedAbsentInterns) {
                const supervisor = await prisma.user.findUnique({
                    where: { id: group.supervisor_id },
                    select: { telegram_username: true } as any
                }) as any;

                if (!supervisor?.telegram_username) {
                    const skipMsg = `[CRON] Supervisor ${group.supervisor_name} has no telegram_username/ChatID`;
                    console.log(skipMsg);
                    debugLog(skipMsg);
                    continue;
                }

                const internList = group.absent_interns
                    .map((intern: any, index: number) => `${index + 1}. <b>${intern.intern_name}</b> (${intern.unit_name})`)
                    .join('\n');

                const title = notificationTitle;
                const message = `
<b>${title}</b>

Halo <b>${group.supervisor_name}</b>,

${customMessage}

${internList}

<i>Silakan cek Internship Management System untuk detail lebih lanjut.</i>

⏰ Waktu: ${jakartaTime.toLocaleString('id-ID')}
                `.trim();

                console.log(`[CRON] Sending to supervisor: ${supervisor.telegram_username} (${group.supervisor_name})`);
                const telegramResult = await sendTelegramNotification({
                    recipientId: supervisor.telegram_username,
                    title: title,
                    message: message,
                    parseMode: 'HTML'
                });

                if (telegramResult.success) sentCount++;
                else {
                    failedCount++;
                    console.error(`[CRON] Failed to send to ${supervisor.telegram_username}:`, telegramResult.error);
                }

                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        const summary = `Task completed for ${scheduleKey}. Sent: ${sentCount}, Failed: ${failedCount}`;
        console.log(`[CRON] ${summary}`);
        debugLog(summary);

        return NextResponse.json({
            success: true,
            task: scheduleKey,
            query: queryType,
            sent: sentCount,
            failed: failedCount
        });

    } catch (error) {
        console.error('[CRON] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
