# Implementasi Fitur Template Notifikasi

Panduan ini menjelaskan arsitektur dan langkah-langkah implementasi untuk fitur manajemen template notifikasi.

## 1. Skema Database (Prisma)

Fitur ini menggunakan model `NotificationTemplate` yang sudah didefinisikan di `prisma/schema.prisma`.

```prisma
model NotificationTemplate {
  id               String    @id @default(uuid()) @db.Uuid
  template_key     String    @unique @db.VarChar(100)
  template_name    String    @db.VarChar(255)
  title            String    @db.VarChar(255)
  message_template String
  description      String?
  variables        Json?
  is_active        Boolean   @default(true)
  created_at       DateTime  @default(now()) @db.Timestamptz(6)
  updated_at       DateTime  @default(now()) @db.Timestamptz(6)
  created_by       String?   @db.Uuid
  updated_by       String?   @db.Uuid

  @@index([template_key], map: "idx_notification_templates_key")
  @@index([is_active], map: "idx_notification_templates_active")
  @@map("notification_templates")
}
```

Pastikan Anda telah menjalankan `npx prisma db push` atau migration untuk menerapkan skema ini.

## 2. Utility Helper

Logic bisnis untuk mengambil dan merender template tersimpan di `src/utils/templates/notification-templates.ts`.

Fungsi utama:
- `getTemplateByKey(key)`: Mengambil template aktif berdasarkan key.
- `renderTemplate(template, variables)`: Mengganti placeholder `{variable}` dengan nilai aktual.
- `formatAttendanceNotificationFromTemplate(...)`: Helper spesifik untuk format notifikasi presensi.

## 3. API Routes

Endpoint backend dibangun menggunakan Next.js App Router API handlers.

### `GET /api/notifications/templates`
Mengambil semua template, diurutkan dari yang terbaru.

### `POST /api/notifications/templates`
Membuat template baru.
**Body:**
```json
{
  "template_key": "string",
  "template_name": "string",
  "title": "string",
  "message_template": "string",
  "description": "string",
  "is_active": boolean
}
```

### `PUT /api/notifications/templates/[id]`
Mengupdate template yang ada.

### `DELETE /api/notifications/templates/[id]`
Menghapus template.

## 4. Halaman Frontend (Admin)

Lokasi: `src/app/admin/notification-templates/page.tsx`

Fitur halaman ini mencakup:
- **Listing Template**: Layout Grid/Card responsif.
- **Preview Mode**: Live preview rendering template dengan data sampel.
- **CRUD Modal**: Form untuk membuat dan mengedit template dengan validasi visual.
- **Status Toggle**: Menandai template aktif/nonaktif.

## 5. Integrasi Menu

Untuk menambahkan halaman ini ke sidebar, update file menu configuration (biasanya di `src/menu-items` atau komponen Sidebar).

Contoh penambahan menu item:

```typescript
{
  id: 'notification-templates',
  title: 'Template Notifikasi',
  type: 'item',
  url: '/admin/notification-templates',
  icon: icons.FileText, // Pastikan import icon yang sesuai
  breadcrumbs: false
}
```

## 6. Cara Penggunaan untuk Developer

Saat ingin mengirim notifikasi menggunakan template ini di kode lain:

```typescript
import { formatAttendanceNotificationFromTemplate } from 'utils/templates/notification-templates';

// Di dalam logic cron job atau handler presensi
const notificationContent = await formatAttendanceNotificationFromTemplate(
  supervisor.name,
  absentInterns
);

if (notificationContent) {
  await sendTelegramMessage(chatId, notificationContent.message);
}
```
