# Supabase Setup Guide

## Prerequisites

1. Account Supabase di [supabase.com](https://supabase.com)
2. Node.js versi 20.9 atau lebih tinggi
3. Project Next.js sudah terinstall

## Step 1: Setup Supabase Project

1. **Buat Project Baru di Supabase**
   - Login ke [supabase.com](https://supabase.com)
   - Klik "New Project"
   - Isi nama project: `puti-internship`
   - Pilih region: `Southeast Asia (Singapore)`
   - Klik "Create new project"
   - Tunggu hingga project selesai dibuat (~2 menit)

2. **Dapatkan API Credentials**
   - Buka project yang baru dibuat
   - Klik "Settings" di sidebar kiri
   - Klik "API" di menu settings
   - Copy nilai berikut:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 2: Run Database Migration

1. **Buka SQL Editor di Supabase**
   - Klik "SQL Editor" di sidebar kiri
   - Klik "New query"

2. **Run Schema Migration**
   - Copy seluruh isi file `supabase/schema.sql`
   - Paste ke SQL Editor
   - Klik "Run" atau tekan `Ctrl + Enter`
   - Pastikan tidak ada error

3. **Run Seed Data (Optional - untuk testing)**
   - Buat query baru
   - Copy seluruh isi file `supabase/seed.sql`
   - Paste ke SQL Editor
   - Klik "Run"
   - Pastikan tidak ada error

4. **Verifikasi Database**
   - Klik "Table Editor" di sidebar
   - Anda harus melihat 4 tabel: `users`, `units`, `attendances`, `monitoring_locations`
   - Jika run seed.sql, setiap tabel harus berisi sample data

## Step 3: Configure Environment Variables

1. **Buat file `.env.local`** di root project
   ```bash
   # Copy dari .env.local.example
   cp .env.local.example .env.local
   ```

2. **Update `.env.local`** dengan credentials dari Step 1
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Step 5: Test Connection

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Open Browser**
   - Buka http://localhost:3001
   - Login atau navigate ke dashboard
   - Check browser console - seharusnya tidak ada error Supabase

3. **Verify Data Display**
   - Navigate ke "Management Data" page
   - Seharusnya menampilkan data dari database (bukan data dummy)
   - Try search, filter, dan pagination

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
