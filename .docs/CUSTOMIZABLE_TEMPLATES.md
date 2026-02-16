# 📝 Template Notifikasi yang Dapat Dimodifikasi

## Overview

Sistem notifikasi Telegram sekarang mendukung **template yang dapat dimodifikasi oleh admin** melalui UI. Admin tidak perlu mengubah kode untuk mengkustomisasi pesan notifikasi.

## 🎯 Fitur Utama

### 1. **Template Management UI**
- Akses: `/admin/notification-templates`
- Buat, edit, hapus, dan preview template
- Real-time preview dengan sample data
- Support HTML formatting

### 2. **Variable Substitution**
Template menggunakan placeholder `{variable_name}` yang akan diganti dengan data real saat notifikasi dikirim.

### 3. **Database-Driven**
Template disimpan di database, bukan hardcoded di kode.

## 📊 Database Schema

```sql
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY,
    template_key VARCHAR(100) UNIQUE NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message_template TEXT NOT NULL,
    description TEXT,
    variables JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);
```

## 🔑 Variabel yang Tersedia

Untuk template `attendance_reminder`:

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `{supervisor_name}` | Nama supervisor | John Doe |
| `{intern_list}` | Daftar anak magang (auto-generated) | 1. Alice Smith (IT)<br>2. Bob Johnson (Network) |
| `{absent_count}` | Jumlah anak magang yang tidak presensi | 2 |
| `{timestamp}` | Waktu notifikasi dikirim | 05/02/2026, 10:00:00 |

## 📝 Contoh Template Default

### Title:
```
🔔 Notifikasi Presensi Anak Magang
```

### Message:
```html
<b>🔔 Notifikasi Presensi Anak Magang</b>

Halo <b>{supervisor_name}</b>,

Berikut adalah daftar anak magang yang <u>belum melakukan presensi hari ini</u>:

{intern_list}

<i>Silakan cek Internship Management System untuk detail lebih lanjut.</i>

⏰ Waktu: {timestamp}
```

## 🎨 Cara Menggunakan

### 1. Akses Template Management
```
1. Login sebagai admin
2. Buka: http://localhost:3000/admin/notification-templates
3. Lihat daftar template yang ada
```

### 2. Edit Template
```
1. Klik tombol Edit (ikon pensil) pada template
2. Modifikasi Title atau Message Template
3. Gunakan {variable_name} untuk placeholder
4. Klik "Preview" untuk melihat hasil
5. Klik "Simpan Template"
```

### 3. Buat Template Baru
```
1. Klik "Buat Template Baru"
2. Isi form:
   - Template Key: unique identifier (e.g., custom_reminder)
   - Nama Template: nama yang mudah dibaca
   - Judul Notifikasi: title pesan
   - Template Pesan: body pesan dengan {variables}
   - Deskripsi: (opsional)
3. Toggle "Template aktif" jika ingin langsung digunakan
4. Klik "Simpan Template"
```

### 4. Preview Template
```
1. Saat edit/create, klik "Tampilkan Preview"
2. Sistem akan menampilkan pesan dengan sample data
3. Cek apakah format sudah sesuai
4. HTML tags akan di-render (bold, italic, underline, dll)
```

## 🔌 API Endpoints

### Get All Templates
```bash
GET /api/notifications/templates

Response:
{
  "success": true,
  "templates": [...]
}
```

### Get Single Template
```bash
GET /api/notifications/templates/{id}

Response:
{
  "success": true,
  "template": {...}
}
```

### Create Template
```bash
POST /api/notifications/templates
Content-Type: application/json

{
  "template_key": "custom_reminder",
  "template_name": "Custom Reminder",
  "title": "Custom Title",
  "message_template": "Message with {variables}",
  "description": "Optional description",
  "is_active": true
}
```

### Update Template
```bash
PUT /api/notifications/templates/{id}
Content-Type: application/json

{
  "template_name": "Updated Name",
  "title": "Updated Title",
  "message_template": "Updated message",
  "is_active": true
}
```

### Delete Template
```bash
DELETE /api/notifications/templates/{id}

Response:
{
  "success": true,
  "message": "Template deleted successfully"
}
```

## 💡 Tips & Best Practices

### 1. Gunakan HTML Formatting
```html
<b>Bold text</b>
<i>Italic text</i>
<u>Underlined text</u>
<code>Monospace text</code>
<a href="url">Link text</a>
```

### 2. Struktur Pesan yang Baik
```
1. Greeting dengan nama ({supervisor_name})
2. Informasi utama (daftar anak magang)
3. Call-to-action (apa yang harus dilakukan)
4. Timestamp atau info tambahan
```

### 3. Testing
```
1. Selalu gunakan Preview sebelum save
2. Test dengan data real di /admin/telegram-notifications
3. Kirim test notification ke diri sendiri dulu
```

### 4. Backup Template
```sql
-- Export template sebelum edit
SELECT * FROM notification_templates 
WHERE template_key = 'attendance_reminder';
```

## 🔄 Workflow Integration

### Sistem Otomatis Menggunakan Template

1. **Cron Job** atau **Manual Trigger** dipanggil
2. Sistem query database untuk template aktif dengan key `attendance_reminder`
3. Sistem ambil data anak magang yang tidak presensi
4. Sistem replace `{variables}` dengan data real
5. Sistem kirim ke Telegram API

### Fallback Mechanism

Jika template tidak ditemukan di database:
```typescript
// Sistem akan fallback ke template hardcoded default
const defaultTemplate = {
    title: '🔔 Notifikasi Presensi Anak Magang',
    message: '...' // Default message
};
```

## 🎯 Use Cases

### 1. Ubah Tone Pesan
**Dari formal ke friendly:**
```html
<!-- Before -->
Berikut adalah daftar anak magang yang belum melakukan presensi hari ini:

<!-- After -->
Halo! Ada beberapa anak magang yang belum check-in nih:
```

### 2. Tambah Informasi
```html
<!-- Tambah link langsung -->
<i>Silakan cek <a href="https://internship.example.com">Internship Management System</a> untuk detail lebih lanjut.</i>
```

### 3. Ubah Format List
```html
<!-- Before -->
{intern_list}

<!-- After (custom formatting di code) -->
📋 Daftar Anak Magang:
{intern_list}

⚠️ Total: {absent_count} orang
```

### 4. Multi-Language Support
Buat template berbeda untuk bahasa berbeda:
```
- attendance_reminder_id (Bahasa Indonesia)
- attendance_reminder_en (English)
```

## 🚨 Troubleshooting

### Template tidak muncul di notifikasi
```
1. Cek template is_active = true
2. Cek template_key = 'attendance_reminder'
3. Restart aplikasi jika perlu
4. Check console logs untuk error
```

### Variables tidak ter-replace
```
1. Pastikan menggunakan {variable_name} bukan {{variable_name}}
2. Cek spelling variable name
3. Lihat available variables di UI
```

### Preview tidak sesuai hasil
```
1. Preview menggunakan sample data
2. Hasil real akan berbeda tergantung data
3. Test dengan data real di /admin/telegram-notifications
```

## 📚 Advanced: Custom Variables

Untuk menambah variable baru, edit file:
`src/utils/templates/notification-templates.ts`

```typescript
// Tambah variable baru
const variables: TemplateVariables = {
    supervisor_name: supervisorName,
    intern_list: internList,
    absent_count: absentInterns.length,
    timestamp: new Date().toLocaleString('id-ID'),
    // Tambah variable baru di sini
    department: 'IT Department',
    manager_name: 'Manager Name'
};
```

Kemudian update UI untuk menampilkan variable baru di available variables list.

## 🔐 Security

- ✅ Only admin can access template management
- ✅ Template validation before save
- ✅ XSS protection (HTML sanitization di Telegram API)
- ✅ Audit trail (created_by, updated_by)

## 📈 Future Enhancements

1. **Template Versioning** - Track changes history
2. **A/B Testing** - Test different templates
3. **Scheduled Templates** - Different template for different times
4. **Conditional Content** - Show/hide content based on conditions
5. **Rich Media** - Support images, buttons, etc.

---

**Dokumentasi dibuat**: 5 Februari 2026  
**Versi**: 1.0.0
