# ✅ Setup Supabase - Checklist

## 📝 Yang Sudah Dibuat

Saya telah membuat file-file berikut untuk membantu setup Supabase Anda:

### 1. **SQL Schema & Seed Data**
- ✅ `supabase/schema.sql` - Schema database lengkap dengan:
  - 4 tabel utama (users, units, attendances, monitoring_locations)
  - 2 views (dashboard_stats, unit_employee_counts)
  - Row Level Security (RLS) policies
  - Indexes untuk performa optimal
  - Triggers untuk auto-update timestamps

- ✅ `supabase/seed.sql` - Sample data untuk testing:
  - 2 admin users
  - 3 supervisor users
  - 10 participant users
  - 5 units/departments
  - Sample attendances
  - Sample monitoring requests

### 2. **Dokumentasi**
- ✅ `README_SUPABASE.md` - Panduan setup step-by-step
- ✅ `DATABASE_SCHEMA.md` - Dokumentasi lengkap struktur database
- ✅ `RESTRUCTURE_GUIDE.md` - Panduan reorganisasi folder
- ✅ `env.example` - Template environment variables

### 3. **Environment Files**
- ✅ `.env.local` - File untuk credentials Supabase (perlu diisi)

---

## 🎯 Langkah Selanjutnya

### Step 1: Setup Supabase Project

1. **Buat project di Supabase:**
   - Buka https://supabase.com
   - Login dan klik "New Project"
   - Nama: `puti-internship`
   - Region: Singapore (Southeast Asia)
   - Simpan database password dengan aman!

2. **Dapatkan API Credentials:**
   - Settings → API
   - Copy `Project URL` dan `anon public key`

### Step 2: Jalankan SQL Schema

1. **Buka SQL Editor di Supabase**
2. **Copy isi file `supabase/schema.sql`**
3. **Paste dan Run** di SQL Editor
4. **Tunggu hingga selesai** (tidak ada error)

### Step 3: Jalankan Seed Data (Opsional)

1. **Buat query baru** di SQL Editor
2. **Copy isi file `supabase/seed.sql`**
3. **Paste dan Run**
4. **Verifikasi** di Table Editor - harus ada data sample

### Step 4: Update Environment Variables

Edit file `.env.local` dan isi dengan credentials Anda:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Settings
NEXT_PUBLIC_ENV=development
NEXTAUTH_URL=http://localhost:3001
```

### Step 5: Restart Development Server

```bash
# Stop server (Ctrl+C)
# Start lagi
npm run dev
```

### Step 6: Test Connection

1. Buka http://localhost:3001
2. Buka Developer Console (F12)
3. Seharusnya **TIDAK ADA** error Supabase
4. Navigate ke Dashboard - data harus muncul dari database

---

## 📚 Dokumentasi Tersedia

1. **README_SUPABASE.md** - Panduan setup lengkap dengan screenshot
2. **DATABASE_SCHEMA.md** - Dokumentasi struktur database:
   - Penjelasan setiap tabel
   - Relationships antar tabel
   - RLS policies
   - Common queries
   - Best practices

3. **RESTRUCTURE_GUIDE.md** - Panduan reorganisasi folder:
   - Struktur folder yang lebih profesional
   - Pemisahan berdasarkan role (admin/supervisor/participant)
   - Best practices Next.js 14+ App Router

---

## 🔧 Troubleshooting

### Error: "Missing Supabase environment variables"
**Solusi:**
1. Pastikan file `.env.local` ada di root folder
2. Pastikan isi credentials sudah benar
3. Restart development server

### Error: "relation does not exist"
**Solusi:**
1. Schema belum dijalankan
2. Jalankan `supabase/schema.sql` di SQL Editor

### Data tidak muncul
**Solusi:**
1. Check browser console untuk error
2. Verify credentials di `.env.local`
3. Check RLS policies di Supabase Dashboard

### Error saat run schema.sql
**Solusi:**
1. Baca pesan error dengan teliti
2. Pastikan tidak ada typo
3. Jalankan ulang dari awal (drop tables jika perlu)

---

## 📞 Support

Jika masih ada masalah:
1. ✅ Check dokumentasi di folder project
2. ✅ Check Supabase documentation: https://supabase.com/docs
3. ✅ Check error message di browser console
4. ✅ Hubungi team lead

---

## 🎉 Setelah Setup Berhasil

Setelah Supabase berhasil disetup, Anda bisa:

1. **Lihat data di dashboard** - statistik real-time
2. **Manage users** - tambah/edit/hapus users
3. **Track attendance** - lihat kehadiran harian
4. **Approve monitoring requests** - approve/reject permintaan lokasi khusus
5. **Generate reports** - export data untuk reporting

---

## 🚀 Next: Reorganisasi Folder

Setelah database berjalan, disarankan untuk:
1. Baca `RESTRUCTURE_GUIDE.md`
2. Reorganisasi struktur folder sesuai best practices
3. Pisahkan routes berdasarkan role (admin/supervisor/participant)
4. Refactor komponen untuk lebih modular

---

**Good luck! 🎯**
