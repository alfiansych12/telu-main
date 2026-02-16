# Contoh Penggunaan Sistem Notifikasi Telegram

## 1. Setup Telegram Username untuk Supervisor

### Via SQL
```sql
-- Update telegram username untuk supervisor
UPDATE users 
SET telegram_username = 'johndoe123' 
WHERE email = 'john.doe@example.com' AND role = 'supervisor';

-- Cek supervisor yang sudah punya telegram username
SELECT id, name, email, telegram_username, role
FROM users
WHERE role = 'supervisor' AND telegram_username IS NOT NULL;

-- Cek supervisor yang belum punya telegram username
SELECT id, name, email, role
FROM users
WHERE role = 'supervisor' AND telegram_username IS NULL;
```

## 2. Test Query - Cek Anak Magang yang Tidak Presensi

### Via SQL
```sql
-- Query lengkap untuk cek anak magang yang tidak presensi hari ini
SELECT 
    u.id as intern_id,
    u.name as intern_name,
    u.email as intern_email,
    un.name as unit_name,
    s.id as supervisor_id,
    s.name as supervisor_name,
    s.email as supervisor_email,
    s.telegram_username,
    u.internship_start,
    u.internship_end
FROM users u
LEFT JOIN attendances a ON u.id = a.user_id AND a.date = CURRENT_DATE
LEFT JOIN users s ON u.supervisor_id = s.id
LEFT JOIN units un ON u.unit_id = un.id
WHERE 
    u.role = 'participant'
    AND u.status = 'active'
    AND u.deleted_at IS NULL
    AND a.id IS NULL  -- Tidak ada record attendance hari ini
    AND u.internship_start <= CURRENT_DATE
    AND (u.internship_end IS NULL OR u.internship_end >= CURRENT_DATE)
    AND s.id IS NOT NULL  -- Harus punya supervisor
ORDER BY s.email, u.name;
```

### Via TypeScript
```typescript
import { getAbsentInternsToday, getAbsentInternsGroupedBySupervisor } from '@/utils/queries/attendance-check';

// Get semua anak magang yang tidak presensi
const absentInterns = await getAbsentInternsToday();
console.log('Absent interns:', absentInterns);

// Get dikelompokkan per supervisor
const grouped = await getAbsentInternsGroupedBySupervisor();
console.log('Grouped by supervisor:', grouped);
```

## 3. Test Kirim Notifikasi Telegram

### Test Single Notification
```typescript
import { sendTelegramNotification } from '@/utils/api/telegram';

const result = await sendTelegramNotification({
    recipientId: 'johndoe123', // Telegram username tanpa @
    title: '🔔 Test Notifikasi',
    message: '<b>Halo!</b> Ini adalah <u>test message</u> dari sistem.',
    parseMode: 'HTML',
    disableNotification: false
});

console.log('Send result:', result);
```

### Test via API Endpoint (Preview)
```bash
# GET - Preview data yang akan dikirim
curl -X GET http://localhost:3000/api/notifications/telegram/send-attendance-alerts \
  -H "Cookie: your-session-cookie-here"
```

### Test via API Endpoint (Send)
```bash
# POST - Kirim notifikasi ke semua supervisor
curl -X POST http://localhost:3000/api/notifications/telegram/send-attendance-alerts \
  -H "Cookie: your-session-cookie-here"
```

## 4. Test Cron Job

### Manual Trigger
```bash
# Trigger cron job secara manual
curl -X GET http://localhost:3000/api/cron/attendance-reminder \
  -H "Authorization: Bearer your-cron-secret-here"
```

### Via Browser (untuk testing lokal)
1. Buka browser
2. Login sebagai admin
3. Buka: `http://localhost:3000/api/cron/attendance-reminder`
4. Tambahkan header Authorization di browser extension (seperti ModHeader)

## 5. Menggunakan Admin Panel

### Akses UI
1. Login sebagai admin
2. Buka: `http://localhost:3000/admin/telegram-notifications`
3. Klik "Refresh Data" untuk melihat preview
4. Klik "Kirim Notifikasi" untuk mengirim ke semua supervisor

### Screenshot Workflow
```
1. [Refresh Data] → Melihat daftar supervisor dengan anak magang yang tidak presensi
2. [Preview Pesan] → Expand untuk melihat format pesan yang akan dikirim
3. [Kirim Notifikasi] → Konfirmasi dan kirim ke semua supervisor
4. [Hasil] → Lihat status pengiriman (success/failed)
```

## 6. Simulasi Skenario Testing

### Skenario 1: Anak Magang Tidak Presensi
```sql
-- 1. Pastikan ada anak magang aktif dengan supervisor
INSERT INTO users (id, email, name, role, status, supervisor_id, internship_start, internship_end)
VALUES 
    ('uuid-1', 'intern1@test.com', 'Test Intern 1', 'participant', 'active', 'supervisor-uuid', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days');

-- 2. Pastikan supervisor punya telegram username
UPDATE users 
SET telegram_username = 'test_supervisor' 
WHERE id = 'supervisor-uuid';

-- 3. JANGAN buat attendance untuk hari ini (biarkan kosong)
-- DELETE FROM attendances WHERE user_id = 'uuid-1' AND date = CURRENT_DATE;

-- 4. Test query
SELECT * FROM users u
LEFT JOIN attendances a ON u.id = a.user_id AND a.date = CURRENT_DATE
WHERE u.id = 'uuid-1';
-- Harusnya attendance NULL

-- 5. Trigger notifikasi via API atau admin panel
```

### Skenario 2: Semua Sudah Presensi
```sql
-- 1. Buat attendance untuk semua anak magang aktif
INSERT INTO attendances (id, user_id, date, check_in_time, status)
SELECT 
    gen_random_uuid(),
    u.id,
    CURRENT_DATE,
    '08:00:00'::time,
    'present'
FROM users u
WHERE u.role = 'participant' 
  AND u.status = 'active'
  AND NOT EXISTS (
      SELECT 1 FROM attendances a 
      WHERE a.user_id = u.id AND a.date = CURRENT_DATE
  );

-- 2. Test - harusnya return empty
-- Trigger API dan harusnya dapat response "Semua sudah presensi"
```

### Skenario 3: Supervisor Tanpa Telegram Username
```sql
-- 1. Hapus telegram username supervisor
UPDATE users 
SET telegram_username = NULL 
WHERE id = 'supervisor-uuid';

-- 2. Trigger notifikasi
-- Harusnya muncul warning "Telegram username tidak terdaftar"
```

## 7. Monitoring & Debugging

### Check Logs
```bash
# Lihat logs di console
# Cari prefix [CRON] untuk cron job logs

# Contoh log yang baik:
# [CRON] Starting attendance reminder job...
# [CRON] Found 3 supervisors with absent interns
# [CRON] ✓ Sent to johndoe123
# [CRON] Job completed. Sent: 3, Failed: 0
```

### Check Database
```sql
-- Cek attendance hari ini
SELECT 
    u.name,
    u.email,
    a.date,
    a.check_in_time,
    a.status
FROM users u
LEFT JOIN attendances a ON u.id = a.user_id AND a.date = CURRENT_DATE
WHERE u.role = 'participant' AND u.status = 'active'
ORDER BY a.date DESC NULLS FIRST;

-- Cek supervisor dengan telegram username
SELECT 
    id,
    name,
    email,
    telegram_username,
    role
FROM users
WHERE role = 'supervisor'
ORDER BY telegram_username NULLS LAST;
```

## 8. Production Deployment

### Environment Variables
```env
# .env.production
DATABASE_URL=your-production-db-url
CRON_SECRET=super-secret-production-token-change-this
```

### Vercel Deployment
```bash
# 1. Push ke repository
git add .
git commit -m "Add Telegram notification system"
git push

# 2. Deploy ke Vercel
vercel --prod

# 3. Set environment variable di Vercel dashboard
# CRON_SECRET=your-secret-token

# 4. Verifikasi cron job aktif di Vercel dashboard
# Cron Jobs → attendance-reminder
```

### Test Production Cron
```bash
# Trigger production cron
curl -X GET https://your-domain.vercel.app/api/cron/attendance-reminder \
  -H "Authorization: Bearer your-production-cron-secret"
```

## 9. Troubleshooting Common Issues

### Issue: "Cannot find module '@/utils/queries/attendance-check'"
**Solution**: 
```bash
# Restart TypeScript server
# Di VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Atau rebuild
npm run build
```

### Issue: "telegram_username does not exist"
**Solution**:
```bash
# Regenerate Prisma client
npx prisma generate

# Atau db push
npx prisma db push
```

### Issue: "Unauthorized" saat akses API
**Solution**:
- Pastikan sudah login sebagai admin
- Check session cookie masih valid
- Untuk cron, pastikan Authorization header benar

### Issue: Notifikasi tidak terkirim
**Solution**:
1. Cek telegram_username sudah benar (tanpa @)
2. Cek API Telkom University masih aktif
3. Cek network/firewall tidak block request
4. Lihat error di console logs

## 10. Best Practices

### 1. Testing di Development
```typescript
// Gunakan test telegram account untuk development
if (process.env.NODE_ENV === 'development') {
    // Override recipient untuk testing
    recipientId = 'test_account';
}
```

### 2. Rate Limiting
```typescript
// Sudah implemented: 500ms delay antar request
// Jangan hapus delay ini untuk menghindari spam
await new Promise(resolve => setTimeout(resolve, 500));
```

### 3. Error Handling
```typescript
// Selalu handle error gracefully
try {
    await sendTelegramNotification(...);
} catch (error) {
    console.error('Failed to send:', error);
    // Jangan throw error, biar proses lanjut ke supervisor berikutnya
}
```

### 4. Monitoring
- Setup monitoring untuk cron job (Vercel dashboard)
- Track success/failure rate
- Alert jika failure rate > 20%

---

**Happy Testing! 🚀**
