# ⚠️ PENTING: Cara Setup Environment Variables

## 🔴 Konfigurasi Login & API
Berdasarkan ketentuan, aplikasi ini menggunakan integrasi **NextAuth** dan **Telkom University OAuth**. Pastikan variabel berikut sudah ada di `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3001/
NEXT_PUBLIC_NEXT_APP_API_URL=http://localhost:3001/api/
NEXT_APP_API_URL_LOGIN=https://auth-v2.telkomuniversity.ac.id/stg/api/oauth/
NEXT_APP_JWT_SECRET=ikRgjkhi15HJiU78-OLKfjngiu
NEXT_APP_JWT_TIMEOUT=86400
NEXTAUTH_SECRET_KEY=LlKq6ZtYbr+hTC073mAmAh9/h2HwMfsFo4hrfCx5mLg=
NEXT_PUBLIC_ENV=local
```

---

## 🔵 Konfigurasi Supabase (Untuk Data Dashboard)
Aplikasi tetap membutuhkan **Supabase** untuk menyimpan data absensi, unit, dan monitoring.

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Buat Project baru: `puti-internship`
3. Ambil URL dan API Key dari **Settings > API**.
4. Masukkan ke `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🚀 Langkah Menjalankan Aplikasi

### 1. Update Database
Buka **SQL Editor** di Supabase, lalu jalankan isi dari:
- `supabase/schema.sql` (Wajib: untuk membuat tabel)
- `supabase/seed.sql` (Opsional: untuk data dummy)

### 2. Jalankan Aplikasi
```bash
# Hapus cache build lama
Remove-Item -Recurse -Force .next

# Jalankan server
npm run dev
```

---

## 🎯 Ringkasan Checklist
- [x] Isi `.env.local` dengan variabel Auth Telkom & Supabase
- [ ] Run `schema.sql` di Supabase SQL Editor
- [ ] Restart server dengan `npm run dev`
