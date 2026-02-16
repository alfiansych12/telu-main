const https = require('http'); // Gunakan http karena localhost

/**
 * Script untuk simulasi Cron Job secara lokal
 * Jalankan ini di terminal terpisah: node scripts/local-cron.js
 */

const CRON_URL = 'http://localhost:3001/api/cron/attendance-reminder';
const CRON_SECRET = 'default-secret-change-me'; // Sesuaikan jika Anda telah mengubahnya di .env

console.log('--- Puti Local Cron Simulator ---');
console.log(`Target: ${CRON_URL}`);
console.log('Menjalankan pengecekan setiap 1 menit...');

function pingCron() {
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    console.log(`[${time}] Pinging cron endpoint...`);

    const options = {
        headers: {
            'Authorization': `Bearer ${CRON_SECRET}`
        }
    };

    https.get(CRON_URL, options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.task) {
                    console.log(`✅ BERHASIL: Jalankan tugas ${json.task}. Terkirim: ${json.sent}, Gagal: ${json.failed}`);
                } else {
                    console.log(`ℹ️ STANDBY: ${json.message}`);
                }
            } catch (e) {
                console.log('❌ ERROR: Gagal membaca respon API.');
            }
        });
    }).on('error', (err) => {
        console.log('❌ ERROR: Pastikan server Next.js (npm run start/dev) menyala di port 3001.');
    });
}

// Jalankan segera
pingCron();

// Jalankan setiap 60 detik
setInterval(pingCron, 60000);
