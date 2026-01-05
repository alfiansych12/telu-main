# 🚀 Panduan Setup Supabase

Panduan lengkap untuk setup database Supabase untuk Puti Internship Management System.

## 📋 Prerequisites

1. ✅ Account Supabase di [supabase.com](https://supabase.com)
2. ✅ Node.js versi 20.9 atau lebih tinggi
3. ✅ Project Next.js sudah terinstall

---

## 🎯 Step 1: Buat Project Supabase

### 1.1 Buat Project Baru

1. Login ke [supabase.com](https://supabase.com)
2. Klik tombol **"New Project"**
3. Isi form dengan detail berikut:
   - **Name**: `puti-internship`
   - **Database Password**: Buat password yang kuat (simpan dengan aman!)
   - **Region**: `Southeast Asia (Singapore)` atau pilih region terdekat
   - **Pricing Plan**: Free (untuk development)
4. Klik **"Create new project"**
5. ⏳ Tunggu ~2-3 menit hingga project selesai dibuat

### 1.2 Dapatkan API Credentials

Setelah project selesai dibuat:

1. Buka project Anda
2. Klik **"Settings"** (⚙️) di sidebar kiri
3. Pilih **"API"** dari menu settings
4. **COPY** nilai-nilai berikut (Anda akan membutuhkannya nanti):

   ```
   Project URL (NEXT_PUBLIC_SUPABASE_URL):
   https://xxxxxxxxxxxxx.supabase.co
   
   anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY):
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

> 💡 **Tip**: Simpan credentials ini di notepad sementara

---

## 🗄️ Step 2: Setup Database Schema

### 2.1 Buka SQL Editor

1. Di dashboard Supabase, klik **"SQL Editor"** di sidebar kiri
2. Klik **"New query"** untuk membuat query baru

### 2.2 Jalankan Schema Migration

1. Buka file `supabase/schema.sql` di project Anda
2. **Copy SEMUA isi file** (Ctrl+A, Ctrl+C)
3. **Paste** ke SQL Editor di Supabase
4. Klik tombol **"Run"** atau tekan `Ctrl + Enter`
5. ✅ Tunggu hingga muncul pesan sukses

> ⚠️ **Penting**: Jika ada error, jangan lanjut ke step berikutnya. Baca pesan error dan perbaiki terlebih dahulu.

### 2.3 Jalankan Seed Data (Opsional - Untuk Testing)

Jika Anda ingin mengisi database dengan data sample untuk testing:

1. Klik **"New query"** lagi di SQL Editor
2. Buka file `supabase/seed.sql` di project Anda
3. **Copy SEMUA isi file**
4. **Paste** ke SQL Editor
5. Klik **"Run"**
6. ✅ Tunggu hingga selesai

### 2.4 Verifikasi Database

1. Klik **"Table Editor"** di sidebar kiri
2. Anda harus melihat 4 tabel berikut:
   - ✅ `users`
   - ✅ `units`
   - ✅ `attendances`
   - ✅ `monitoring_locations`
3. Jika Anda menjalankan seed.sql, klik masing-masing tabel untuk melihat data sample

---

## ⚙️ Step 3: Konfigurasi Environment Variables

### 3.1 Buat File `.env.local`

Di root folder project Anda, buat file baru bernama `.env.local`:

**Windows (PowerShell):**
```powershell
New-Item .env.local -ItemType File
```

**Mac/Linux:**
```bash
touch .env.local
```

### 3.2 Isi Environment Variables

Buka file `.env.local` dan isi dengan credentials dari Step 1.2:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> 🔒 **Security Note**: File `.env.local` sudah ada di `.gitignore`, jadi tidak akan ter-commit ke Git

---

## 📦 Step 4: Install Dependencies

Pastikan dependencies Supabase sudah terinstall:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Atau jika menggunakan yarn:

```bash
yarn add @supabase/supabase-js @supabase/ssr
```

---

## 🧪 Step 5: Test Connection

### 5.1 Start Development Server

```bash
npm run dev
```

### 5.2 Buka Browser

1. Buka http://localhost:3001
2. Buka **Developer Console** (F12 atau Ctrl+Shift+I)
3. Cek tab **Console** - seharusnya **TIDAK ADA** error terkait Supabase

### 5.3 Verify Data Display

1. Navigate ke halaman **"Dashboard"**
2. Anda seharusnya melihat:
   - ✅ Total Users, Supervisors, Units (jika ada data)
   - ✅ Chart attendance
   - ✅ Recent activity
3. Navigate ke **"Management Data"** page
4. Seharusnya menampilkan data dari database (bukan dummy data)
5. Coba fitur search, filter, dan pagination

---

## Database Schema Overview

### Tables

1. **users** - Data participants, supervisors, dan admin
   - Fields: email, name, role, unit_id, status, internship dates
   - Relations: belongs to unit

2. **units** - Organizational units/departments
   - Fields: name, department, manager_id, status
   - Relations: has many users, belongs to manager (user)

3. **attendances** - Daily check-in/out records
   - Fields: user_id, date, check_in_time, check_out_time, activity, status
   - Relations: belongs to user

4. **monitoring_locations** - Special location check-in requests
   - Fields: user_id, location_name, coordinates, request_date, status
   - Relations: belongs to user

### Views

- **dashboard_stats** - Statistics untuk dashboard
- **unit_employee_counts** - Jumlah employee per unit

## Row Level Security (RLS)

Database menggunakan RLS policies untuk security:

- **Admins**: Full access ke semua data
- **Supervisors**: View users dan attendances di unit mereka
- **Participants**: View dan create data mereka sendiri

## Troubleshooting

### Error: "Invalid API key"
- Pastikan `.env.local` memiliki credentials yang benar
- Restart development server setelah update .env.local

### Error: "relation does not exist"
- Schema belum dijalankan
- Jalankan `supabase/schema.sql` di SQL Editor Supabase

### Data tidak muncul di UI
- Check browser console untuk error
- Verify credentials di `.env.local`
- Check apakah seed.sql sudah dijalankan (jika ingin sample data)

### RLS Policy Error
- Pastikan user sudah login/authenticated
- Check policies di Supabase Dashboard → Authentication → Policies

## Next Steps

1. **Production Deployment**
   - Update environment variables di platform deployment (Vercel, etc)
   - Gunakan production credentials dari Supabase

2. **Backup Database**
   - Supabase otomatis backup daily
   - Manual backup: Database → Backups

3. **Monitoring**
   - Check database usage di Supabase Dashboard
   - Monitor API requests di Logs & metrics

## Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
