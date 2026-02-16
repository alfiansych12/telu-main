# 🔔 Sistem Notifikasi Telegram - Quick Start

## 📌 Ringkasan

Sistem ini mengirim notifikasi Telegram otomatis ke supervisor (VIC) ketika anak magang mereka tidak melakukan presensi.

## 🚀 Quick Setup (5 Menit)

### 1. Update Database
```bash
npx prisma db push
npx prisma generate
```

### 2. Set Environment Variable
```env
# .env
CRON_SECRET=rahasia-anda-disini
```

### 3. Daftarkan Telegram Username Supervisor
```sql
UPDATE users 
SET telegram_username = 'username_telegram' 
WHERE email = 'supervisor@example.com';
```

### 4. Test via Admin Panel
1. Login sebagai admin
2. Buka: `http://localhost:3000/admin/telegram-notifications`
3. Klik "Refresh Data"
4. Klik "Kirim Notifikasi"

## 📊 Query SQL Utama

```sql
-- Anak magang yang tidak presensi hari ini + email VIC
SELECT 
    u.name as intern_name,
    u.email as intern_email,
    s.name as supervisor_name,
    s.email as supervisor_email,
    s.telegram_username
FROM users u
LEFT JOIN attendances a ON u.id = a.user_id AND a.date = CURRENT_DATE
LEFT JOIN users s ON u.supervisor_id = s.id
WHERE 
    u.role = 'participant'
    AND u.status = 'active'
    AND a.id IS NULL
    AND s.id IS NOT NULL;
```

## 🔌 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/notifications/telegram/send-attendance-alerts` | Preview data |
| POST | `/api/notifications/telegram/send-attendance-alerts` | Kirim notifikasi |
| GET | `/api/cron/attendance-reminder` | Cron job (auto) |

## 📝 Template Notifikasi (Bisa Dimodifikasi!)

**Admin bisa mengubah teks notifikasi tanpa coding!**

### Akses Template Manager:
```
http://localhost:3000/admin/notification-templates
```

### Fitur:
- ✏️ Edit pesan notifikasi via UI
- 👁️ Preview real-time
- 🎨 Support HTML formatting
- 🔄 Gunakan variabel: `{supervisor_name}`, `{intern_list}`, `{timestamp}`

**Dokumentasi lengkap**: `.docs/CUSTOMIZABLE_TEMPLATES.md`


## ⏰ Jadwal Otomatis

Notifikasi otomatis terkirim pada:
- **10:00 WIB** (pagi)
- **14:00 WIB** (siang)
- **Senin - Jumat** saja

## 📱 Format Pesan

```
🔔 Notifikasi Presensi Anak Magang

Halo John Doe,

Berikut adalah daftar anak magang yang belum melakukan presensi hari ini:

1. Alice Smith (IT Support)
2. Bob Johnson (Network Team)

Silakan cek Internship Management System untuk detail lebih lanjut.

⏰ Waktu: 05/02/2026, 10:00:00
```

## 📁 File Penting

```
src/
├── utils/
│   ├── queries/attendance-check.ts       # Query logic
│   └── api/telegram.ts                    # Telegram API
├── app/
│   ├── api/notifications/telegram/...    # API endpoints
│   ├── api/cron/attendance-reminder/...  # Cron job
│   └── admin/telegram-notifications/...  # Admin UI
```

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Import error | `npx prisma generate` |
| Unauthorized | Login sebagai admin |
| Tidak terkirim | Cek telegram_username di database |
| Cron tidak jalan | Cek `vercel.json` dan redeploy |

## 📚 Dokumentasi Lengkap

- **Full Documentation**: `.docs/TELEGRAM_NOTIFICATION_SYSTEM.md`
- **Usage Examples**: `.docs/TELEGRAM_USAGE_EXAMPLES.md`

## 💡 Pengembangan Ide

Sistem ini bisa dikembangkan lebih lanjut:

1. ✅ **Notifikasi ke Anak Magang** - Kirim reminder langsung ke intern
2. ✅ **Dashboard Analytics** - Statistik presensi & notifikasi
3. ✅ **Custom Schedule** - Supervisor set jam notifikasi sendiri
4. ✅ **Multi-Channel** - WhatsApp, Email, SMS
5. ✅ **Smart Notifications** - Skip jika cuti/izin
6. ✅ **Escalation** - Notifikasi ke manager jika tidak ada respon

## 🎯 Next Steps

1. **Setup telegram username** untuk semua supervisor
2. **Test manual** via admin panel
3. **Monitor cron job** di production
4. **Collect feedback** dari supervisor
5. **Iterate & improve** berdasarkan feedback

---

**Need help?** Lihat dokumentasi lengkap atau hubungi tim development.
