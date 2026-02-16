# 📋 ALUR SISTEM PENDAFTARAN PESERTA MAGANG

## 🎯 OVERVIEW

Sistem pendaftaran ini memungkinkan calon peserta magang untuk mendaftar secara online melalui formulir dinamis yang dibuat oleh Admin. Setelah pendaftaran, Admin dapat mereview dan menyetujui aplikasi, yang secara otomatis akan membuat akun pengguna untuk peserta.

---

## 📊 DIAGRAM ALUR

```
┌─────────────────────────────────────────────────────────────────┐
│                    ALUR LENGKAP SISTEM                          │
└─────────────────────────────────────────────────────────────────┘

1. ADMIN MEMBUAT FORM
   └─> /admin/registration/forms
       ├─ Buat formulir baru dengan field dinamis
       ├─ Tentukan slug URL (misal: magang-2026)
       ├─ Aktifkan form untuk publik
       └─ Simpan konfigurasi

2. CALON PESERTA MENGISI FORM
   └─> /registration/[slug]  (misal: /registration/magang-2026)
       ├─ Akses link publik
       ├─ Isi semua field yang diminta
       │  ├─ Nama Lengkap
       │  ├─ Email
       │  ├─ NIM/NISN
       │  ├─ Institusi Asal
       │  └─ Field lainnya sesuai form
       └─ Submit → Status: PENDING

3. ADMIN REVIEW APLIKASI
   └─> /admin/registration/applications
       ├─ Lihat semua aplikasi masuk
       ├─ Filter berdasarkan status (Pending/Approved/Rejected)
       ├─ Klik "View Details" untuk melihat detail
       └─ Pilih aksi:
           ├─ APPROVE → Lanjut ke step 4
           └─ REJECT → Status berubah jadi REJECTED

4. PROSES OTOMATIS SETELAH APPROVE
   ├─ ✅ Status aplikasi → APPROVED
   ├─ 🔐 Generate password random (12 karakter)
   ├─ 👤 Buat akun user baru:
   │   ├─ Email: dari form
   │   ├─ Password: random generated
   │   ├─ Role: participant
   │   ├─ Status: active
   │   ├─ Nama, NIM, Institusi: dari form
   │   └─ Periode magang: dari form atau default 3 bulan
   ├─ 📁 Buat entry di Institution Archive
   └─ 📧 Tampilkan dialog dengan kredensial login

5. ADMIN INFORMASIKAN KE PESERTA
   └─ Dialog sukses menampilkan:
       ├─ Email login
       ├─ Password temporary
       ├─ Tombol copy untuk setiap field
       └─ Tombol "Copy All Credentials"
   
6. PESERTA LOGIN PERTAMA KALI
   └─> /login
       ├─ Gunakan email & password dari admin
       ├─ Akses dashboard peserta
       └─ (Opsional) Ganti password
```

---

## 🔧 KOMPONEN SISTEM

### 1. **Form Builder** (`/admin/registration/forms`)

**Fungsi:**
- Admin membuat formulir pendaftaran dinamis
- Menentukan field-field yang diperlukan
- Mengatur slug URL untuk akses publik

**Field Types yang Tersedia:**
- ✏️ Plain Text
- 📝 Paragraph (Textarea)
- 🔢 Numbers
- 📅 Date Picker
- ⏰ Time
- 📋 Dropdown (Select)
- ☑️ Checkboxes
- 📎 File Upload

**Best Practices:**
- Selalu sertakan field: **Nama Lengkap**, **Email**, **NIM/NISN**
- Gunakan label yang jelas (misal: "Email" bukan "E-mail Address")
- Tandai field penting sebagai **Required**

---

### 2. **Public Registration Form** (`/registration/[slug]`)

**Fungsi:**
- Halaman publik yang bisa diakses calon peserta
- Menampilkan form sesuai konfigurasi admin
- Menyimpan data ke database dengan status PENDING

**URL Format:**
```
http://localhost:3001/registration/magang-2026
http://localhost:3001/registration/internship-feb-2026
```

**Data yang Tersimpan:**
- Semua jawaban dari form
- Nama institusi
- Timestamp submission
- Status: pending

---

### 3. **Applications Management** (`/admin/registration/applications`)

**Fungsi:**
- Review semua aplikasi yang masuk
- Filter berdasarkan status
- Approve atau reject aplikasi

**Fitur:**
- 🔍 Search by nama atau institusi
- 🏷️ Filter by status (All/Pending/Approved/Rejected)
- 👁️ View detail aplikasi
- ✅ Approve (buat akun otomatis)
- ❌ Reject
- 📊 Export to Excel

---

## 🔐 LOGIKA APPROVAL & USER CREATION

### Proses Approval (Backend)

**File:** `src/app/api/registration/applications/[id]/route.ts`

**Langkah-langkah:**

1. **Extract Data dari Form Responses**
   ```typescript
   // Sistem mencari field berdasarkan label keywords
   name = findValueByLabel(['name', 'nama', 'full name'])
   email = findValueByLabel(['email', 'e-mail'])
   phone = findValueByLabel(['phone', 'wa', 'whatsapp'])
   idNumber = findValueByLabel(['nim', 'nisn', 'student id'])
   ```

2. **Generate Password Random**
   ```typescript
   // 12 karakter: huruf besar, kecil, angka, simbol
   // Contoh: aB3d#Ef9Gh2K
   ```

3. **Create User Account**
   ```typescript
   {
     email: "student@example.com",
     password: "aB3d#Ef9Gh2K",
     role: "participant",
     status: "active",
     name: "John Doe",
     id_number: "123456789",
     institution_name: "Universitas ABC",
     internship_start: "2026-02-16",
     internship_end: "2026-05-16"
   }
   ```

4. **Create Archive Entry**
   ```typescript
   {
     institution_name: "Universitas ABC",
     document_name: "Registration_Universitas_ABC_John_Doe_1234567890.pdf",
     internship_period_start: "2026-02-16",
     internship_period_end: "2026-05-16"
   }
   ```

5. **Return Success Response**
   ```json
   {
     "success": true,
     "message": "✅ Application approved...",
     "createdUser": { ... },
     "application": { ... }
   }
   ```

---

## 🎨 UI/UX IMPROVEMENTS

### Success Dialog

Setelah approval berhasil, sistem menampilkan dialog dengan:

✅ **Informasi Lengkap:**
- Nama peserta
- Email (username)
- Password temporary
- ID Number

📋 **Copy to Clipboard:**
- Tombol copy untuk setiap field
- Tombol "Copy All Credentials" untuk copy semua sekaligus

⚠️ **Next Steps:**
- Instruksi jelas untuk admin
- Reminder untuk inform peserta
- Saran untuk ganti password

---

## 📝 FIELD MAPPING LOGIC

Sistem menggunakan **keyword matching** untuk memetakan field form ke data user:

| Data User | Keywords yang Dicari |
|-----------|---------------------|
| `name` | name, nama, full name, nama lengkap |
| `email` | email, e-mail, surel |
| `phone` | phone, mobile, wa, whatsapp, hp, telepon, no hp |
| `id_number` | nim, nisn, student id, nomor induk, id number |
| `internship_start` | start date, mulai, tanggal mulai, internship start |
| `internship_end` | end date, selesai, tanggal selesai, internship end |

**Fallback Logic:**
- Jika email tidak ditemukan, sistem mencari pattern email di semua responses
- Jika masih tidak ada, generate email: `{nama}.{institusi}@temp-intern.local`

---

## 🚀 CARA PENGGUNAAN

### Untuk Admin:

#### 1. Membuat Form Baru
```
1. Buka /admin/registration/forms
2. Klik "Create New Form"
3. Isi Basic Info:
   - Title: "Pendaftaran Magang Februari 2026"
   - Slug: "magang-feb-2026"
   - Description: "Formulir pendaftaran..."
4. Tambah Field:
   - Full Name (text, required)
   - Email (text, required)
   - Student ID / NIM (text, required)
   - Origin Institution (text, required)
   - Phone Number (text)
   - Start Date (date)
   - End Date (date)
5. Aktifkan: Toggle "Active Status"
6. Klik "Save Configuration"
```

#### 2. Share Link ke Calon Peserta
```
http://localhost:3001/registration/magang-feb-2026
```

#### 3. Review & Approve Aplikasi
```
1. Buka /admin/registration/applications
2. Lihat aplikasi dengan status PENDING
3. Klik ikon "Eye" untuk view detail
4. Klik "Approve & Create Account"
5. Dialog sukses muncul dengan kredensial
6. Copy kredensial
7. Kirim ke peserta via email/WA
```

### Untuk Peserta:

#### 1. Mengisi Form
```
1. Akses link yang diberikan admin
2. Isi semua field yang required (*)
3. Klik "Submit Application"
4. Tunggu approval dari admin
```

#### 2. Login Setelah Diapprove
```
1. Terima kredensial dari admin
2. Buka /login
3. Masukkan email & password
4. Akses dashboard peserta
5. (Opsional) Ganti password di profile
```

---

## ⚠️ TROUBLESHOOTING

### Problem: Email tidak terdeteksi dari form

**Solusi:**
- Pastikan field email menggunakan label: "Email" atau "E-mail"
- Atau sistem akan auto-detect pattern email
- Atau generate fallback email

### Problem: User sudah ada dengan email yang sama

**Response:**
```
⚠️ Application approved, but user with email xxx@example.com 
already exists in the system.
```

**Solusi:**
- Cek di Management Data apakah user sudah terdaftar
- Jika ya, inform peserta untuk login dengan akun existing
- Jika perlu, update data user manual

### Problem: Password tidak muncul di dialog

**Solusi:**
- Pastikan backend mengirim `createdUser` dan `message` di response
- Check console browser untuk error
- Refresh halaman dan coba approve lagi

---

## 🔄 FUTURE IMPROVEMENTS

### 1. **Automatic Email Notification**
```typescript
// TODO: Implement di backend
await sendWelcomeEmail({
  to: email,
  subject: "Welcome to Internship Program",
  body: `Your credentials:\nEmail: ${email}\nPassword: ${password}`
});
```

### 2. **Telegram Notification**
```typescript
// TODO: Integrate dengan sistem notifikasi Telegram existing
await sendTelegramNotification({
  chatId: participantChatId,
  message: `✅ Your application has been approved!`
});
```

### 3. **Password Reset Link**
- Generate token untuk reset password
- Kirim link ke email peserta
- Peserta bisa set password sendiri

### 4. **Form Field Mapping Configuration**
- Admin bisa set mapping manual di form builder
- Misal: "Field 'Email Mahasiswa' → map to user.email"

### 5. **Bulk Approval**
- Select multiple applications
- Approve sekaligus
- Generate Excel dengan semua kredensial

---

## 📊 DATABASE SCHEMA

### RegistrationForm
```prisma
model RegistrationForm {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  description String?
  fields      Json     // Array of field definitions
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
}
```

### RegistrationSubmission
```prisma
model RegistrationSubmission {
  id               String   @id @default(uuid())
  form_id          String
  institution_name String
  responses        Json     // Key-value pairs of answers
  status           String   @default("pending") // pending/approved/rejected
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
}
```

### User (Participant)
```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  password          String
  name              String
  role              String    // "participant"
  status            String    // "active"
  institution_name  String?
  phone             String?
  id_number         String?   // NIM/NISN
  internship_start  DateTime?
  internship_end    DateTime?
  created_at        DateTime  @default(now())
}
```

### InstitutionArchive
```prisma
model InstitutionArchive {
  id                       String   @id @default(uuid())
  institution_name         String
  internship_period_start  DateTime
  internship_period_end    DateTime
  document_name            String
  document_url             String
  created_at               DateTime @default(now())
}
```

---

## 📞 SUPPORT

Jika ada pertanyaan atau masalah:
1. Check dokumentasi ini terlebih dahulu
2. Check console browser/server untuk error messages
3. Verify database entries di Prisma Studio
4. Contact developer team

---

**Last Updated:** 2026-02-16  
**Version:** 1.0.0  
**Author:** System Development Team
