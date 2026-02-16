# Sistem Notifikasi Telegram untuk Presensi Anak Magang

## 📋 Deskripsi

Sistem ini secara otomatis mengirimkan notifikasi Telegram kepada supervisor (VIC) ketika anak magang mereka tidak melakukan presensi pada hari tersebut.

## 🎯 Fitur Utama

1. **Query Otomatis**: Mengambil data anak magang yang tidak presensi hari ini beserta email VIC
2. **Notifikasi Telegram**: Mengirim pesan terformat HTML ke Telegram supervisor
3. **Cron Job**: Otomatis menjalankan pengecekan pada jam tertentu (10 pagi & 2 siang)
4. **Admin Panel**: Interface untuk preview dan manual trigger notifikasi
5. **Batch Processing**: Mengelompokkan anak magang per supervisor untuk efisiensi

## 🗄️ Database Schema

### Perubahan pada tabel `users`

```sql
ALTER TABLE users ADD COLUMN telegram_username VARCHAR(255);
CREATE INDEX idx_users_telegram_username ON users(telegram_username);
```

Field `telegram_username` menyimpan username Telegram supervisor (tanpa @).

## 📁 Struktur File

```
src/
├── utils/
│   ├── queries/
│   │   └── attendance-check.ts          # Query untuk cek presensi
│   └── api/
│       └── telegram.ts                   # Telegram API integration
├── app/
│   ├── api/
│   │   ├── notifications/
│   │   │   └── telegram/
│   │   │       └── send-attendance-alerts/
│   │   │           └── route.ts          # API endpoint untuk kirim notifikasi
│   │   └── cron/
│   │       └── attendance-reminder/
│   │           └── route.ts              # Cron job endpoint
│   └── admin/
│       └── telegram-notifications/
│           └── page.tsx                  # Admin panel UI
prisma/
├── schema.prisma                         # Updated schema
└── migrations/
    └── add_telegram_username.sql         # Migration file
vercel.json                               # Cron configuration
```

## 🔧 Setup & Konfigurasi

### 1. Database Migration

Jalankan migration untuk menambahkan field `telegram_username`:

```bash
# Jika menggunakan Prisma
npx prisma db push

# Atau jalankan SQL manual
psql -d your_database -f prisma/migrations/add_telegram_username.sql
```

### 2. Environment Variables

Tambahkan ke `.env`:

```env
# Secret untuk mengamankan cron endpoint
CRON_SECRET=your-super-secret-token-here
```

### 3. Daftarkan Telegram Username Supervisor

Update telegram username untuk setiap supervisor di database:

```sql
UPDATE users 
SET telegram_username = 'namauser_telegram' 
WHERE email = 'supervisor@example.com';
```

Atau melalui UI admin (bisa dikembangkan lebih lanjut).

## 📊 Query SQL

### Query Utama (Raw SQL)

```sql
SELECT 
    u.id as intern_id,
    u.name as intern_name,
    u.email as intern_email,
    un.name as unit_name,
    s.id as supervisor_id,
    s.name as supervisor_name,
    s.email as supervisor_email,
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

## 🔌 API Endpoints

### 1. Preview Notifikasi (GET)

**Endpoint**: `GET /api/notifications/telegram/send-attendance-alerts`

**Auth**: Admin only

**Response**:
```json
{
  "success": true,
  "date": "2026-02-05T16:00:00.000Z",
  "total_supervisors": 3,
  "total_absent_interns": 7,
  "preview": [
    {
      "supervisor_name": "John Doe",
      "supervisor_email": "john@example.com",
      "telegram_username": "johndoe",
      "absent_count": 2,
      "absent_interns": [
        {
          "intern_name": "Alice",
          "unit_name": "IT Support"
        }
      ],
      "preview_message": "..."
    }
  ]
}
```

### 2. Kirim Notifikasi (POST)

**Endpoint**: `POST /api/notifications/telegram/send-attendance-alerts`

**Auth**: Admin only

**Response**:
```json
{
  "success": true,
  "message": "Notifikasi terkirim ke 3 supervisor",
  "sent": 3,
  "failed": 0,
  "total_supervisors": 3,
  "results": [
    {
      "supervisor": "john@example.com",
      "telegram_username": "johndoe",
      "absent_count": 2,
      "success": true
    }
  ]
}
```

### 3. Cron Job (GET)

**Endpoint**: `GET /api/cron/attendance-reminder`

**Auth**: Bearer token (CRON_SECRET)

**Headers**:
```
Authorization: Bearer your-cron-secret
```

**Behavior**:
- Hanya berjalan di hari kerja (Senin-Jumat)
- Skip di weekend
- Otomatis kirim notifikasi ke semua supervisor dengan anak magang yang tidak presensi

## 📱 Format Pesan Telegram

Pesan yang dikirim menggunakan format HTML:

```html
🔔 Notifikasi Presensi Anak Magang

Halo <b>John Doe</b>,

Berikut adalah daftar anak magang yang <u>belum melakukan presensi hari ini</u>:

1. <b>Alice Smith</b> (IT Support)
2. <b>Bob Johnson</b> (Network Team)

<i>Silakan cek Internship Management System untuk detail lebih lanjut.</i>

⏰ Waktu: 05/02/2026, 10:00:00
```

## ⏰ Cron Schedule

Konfigurasi di `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/attendance-reminder",
      "schedule": "0 10,14 * * 1-5"
    }
  ]
}
```

**Schedule**: 
- Jam 10:00 WIB (pagi)
- Jam 14:00 WIB (siang)
- Hanya hari kerja (Senin-Jumat)

Format cron: `minute hour day month day-of-week`

## 🎨 Admin Panel

Akses: `/admin/telegram-notifications`

**Fitur**:
- ✅ Preview data anak magang yang belum presensi
- ✅ Lihat supervisor dan telegram username mereka
- ✅ Preview pesan yang akan dikirim
- ✅ Kirim notifikasi manual
- ✅ Lihat hasil pengiriman (success/failed)
- ✅ Refresh data real-time

## 🔐 Keamanan

1. **Admin Only**: Hanya admin yang bisa akses endpoint notifikasi
2. **Cron Secret**: Cron endpoint dilindungi dengan bearer token
3. **Rate Limiting**: Delay 500ms antar pengiriman untuk menghindari spam
4. **Error Handling**: Comprehensive error handling dan logging

## 🚀 Deployment

### Vercel

1. Push code ke repository
2. Deploy ke Vercel
3. Set environment variable `CRON_SECRET`
4. Cron akan otomatis berjalan sesuai schedule

### Manual Trigger

Untuk testing atau manual trigger:

```bash
curl -X POST https://your-domain.com/api/notifications/telegram/send-attendance-alerts \
  -H "Cookie: your-session-cookie"
```

Atau gunakan admin panel di browser.

## 🧪 Testing

### Test Query

```typescript
import { getAbsentInternsToday } from '@/utils/queries/attendance-check';

const result = await getAbsentInternsToday();
console.log(result);
```

### Test Telegram API

```typescript
import { sendTelegramNotification } from '@/utils/api/telegram';

await sendTelegramNotification({
  recipientId: 'your_telegram_username',
  title: 'Test',
  message: '<b>Hello World</b>',
  parseMode: 'HTML'
});
```

### Test Cron Endpoint

```bash
curl -X GET https://your-domain.com/api/cron/attendance-reminder \
  -H "Authorization: Bearer your-cron-secret"
```

## 📈 Monitoring & Logs

Semua aktivitas dicatat di console dengan prefix `[CRON]`:

```
[CRON] Starting attendance reminder job...
[CRON] Found 3 supervisors with absent interns
[CRON] ✓ Sent to johndoe
[CRON] ✗ Failed to send to janedoe: No telegram username
[CRON] Job completed. Sent: 2, Failed: 1
```

## 🔄 Workflow

1. **Cron Trigger** (10:00 & 14:00 WIB)
   ↓
2. **Query Database** (cek anak magang yang tidak presensi)
   ↓
3. **Group by Supervisor** (kelompokkan per VIC)
   ↓
4. **Get Telegram Username** (dari database)
   ↓
5. **Format Message** (HTML formatted)
   ↓
6. **Send to Telegram API** (Telkom University API)
   ↓
7. **Log Results** (success/failed)

## 💡 Pengembangan Lebih Lanjut

### Ide Fitur Tambahan:

1. **UI untuk Set Telegram Username**
   - Form di profile supervisor untuk input telegram username
   - Validasi username

2. **Notifikasi ke Anak Magang**
   - Kirim reminder langsung ke anak magang juga
   - Tambah telegram_username di participant

3. **Custom Schedule per Supervisor**
   - Supervisor bisa set jam notifikasi sendiri
   - Simpan di database

4. **Dashboard Analytics**
   - Statistik presensi
   - History notifikasi terkirim
   - Success rate

5. **Multiple Channels**
   - Tambah WhatsApp notification
   - Email notification (sudah ada)
   - SMS notification

6. **Smart Notifications**
   - Jangan kirim jika supervisor sedang cuti
   - Jangan kirim jika anak magang sudah izin/sakit
   - Escalation ke manager jika tidak ada respon

## 🐛 Troubleshooting

### Notifikasi tidak terkirim

1. Cek telegram_username sudah terdaftar di database
2. Cek CRON_SECRET sudah benar
3. Cek API Telkom University masih aktif
4. Lihat console logs untuk error details

### Cron tidak berjalan

1. Pastikan `vercel.json` sudah di-commit
2. Redeploy aplikasi
3. Cek Vercel dashboard → Cron Jobs

### Query lambat

1. Pastikan index sudah dibuat
2. Gunakan raw SQL version untuk performa lebih baik
3. Consider caching untuk data yang sering diakses

## 📞 Support

Untuk pertanyaan atau issue, hubungi tim development atau buat issue di repository.

---

**Dibuat oleh**: Antigravity AI Assistant  
**Tanggal**: 5 Februari 2026  
**Versi**: 1.0.0
