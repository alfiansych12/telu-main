

/**
 * Telegram Bot API Integration
 * Menggunakan API Telkom University untuk mengirim notifikasi via Telegram
 */

const TELEGRAM_API_URL = 'https://api-v2.telkomuniversity.ac.id/asst-sd/2b1124b06656a9f1be88c3c978561a643f358d1275ef5ae3d2b44cce5a1fc5b4';

export interface TelegramNotificationParams {
    recipientId: string; // Username Telegram atau Chat ID
    title: string;
    message: string;
    parseMode?: 'HTML' | 'Markdown';
    disableNotification?: boolean;
}

export interface TelegramApiResponse {
    success: boolean;
    message?: string;
    error?: string;
}

/**
 * Kirim notifikasi Telegram menggunakan API Telkom University
 */
export async function sendTelegramNotification(
    params: TelegramNotificationParams
): Promise<TelegramApiResponse> {
    try {
        const payload = {
            channel: 'telegram',
            recipientId: params.recipientId,
            title: params.title,
            message: params.message,
            metadata: {
                parseMode: params.parseMode || 'HTML',
                disableNotification: params.disableNotification || false
            }
        };

        const response = await fetch(TELEGRAM_API_URL, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Telegram API error:', errorText);
            return {
                success: false,
                error: `API returned ${response.status}: ${errorText}`
            };
        }

        const data = await response.json();

        // API Telkom University mengembalikan hasil dalam array 'results'
        const mainResult = data.results?.[0];
        const isSuccess = data.success !== false && mainResult?.success !== false;

        if (!isSuccess) {
            const errorMsg = mainResult?.error || data.message || 'Unknown API error';
            return {
                success: false,
                error: errorMsg
            };
        }

        return {
            success: true,
            message: mainResult?.status || 'Notification sent successfully'
        };
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Kirim notifikasi batch ke multiple recipients
 */
export async function sendBatchTelegramNotifications(
    notifications: TelegramNotificationParams[]
): Promise<{ sent: number; failed: number; results: TelegramApiResponse[] }> {
    const results = await Promise.allSettled(
        notifications.map(notification => sendTelegramNotification(notification))
    );

    let sent = 0;
    let failed = 0;
    const responses: TelegramApiResponse[] = [];

    results.forEach(result => {
        if (result.status === 'fulfilled') {
            responses.push(result.value);
            if (result.value.success) {
                sent++;
            } else {
                failed++;
            }
        } else {
            responses.push({
                success: false,
                error: result.reason?.message || 'Promise rejected'
            });
            failed++;
        }
    });

    return { sent, failed, results: responses };
}

/**
 * Format pesan untuk notifikasi presensi
 * Menggunakan template dari database jika tersedia, fallback ke default
 */
export async function formatAttendanceNotificationMessage(
    supervisorName: string,
    absentInterns: Array<{ intern_name: string; unit_name: string }>
): Promise<{ title: string; message: string }> {
    // Try to get template from database
    const { formatAttendanceNotificationFromTemplate } = await import('@/utils/templates/notification-templates');
    const templateResult = await formatAttendanceNotificationFromTemplate(supervisorName, absentInterns);

    if (templateResult) {
        return templateResult;
    }

    // Fallback to default template
    const internList = absentInterns
        .map((intern, index) => `${index + 1}. <b>${intern.intern_name}</b> (${intern.unit_name})`)
        .join('\n');

    const message = `
<b>🔔 Notifikasi Presensi Anak Magang</b>

Halo <b>${supervisorName}</b>,

Berikut adalah daftar anak magang yang <u>belum melakukan presensi hari ini</u>:

${internList}

<i>Silakan cek Internship Management System untuk detail lebih lanjut.</i>

⏰ Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
    `.trim();

    return {
        title: '🔔 Notifikasi Presensi Anak Magang',
        message
    };
}
