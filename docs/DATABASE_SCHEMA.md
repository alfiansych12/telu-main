# 📊 Database Schema Documentation

Dokumentasi lengkap struktur database Puti Internship Management System.

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Tables](#tables)
3. [Views](#views)
4. [Relationships](#relationships)
5. [Row Level Security](#row-level-security)
6. [Indexes](#indexes)

---

## Overview

Database menggunakan **PostgreSQL** melalui **Supabase** dengan 4 tabel utama:

- `users` - Data pengguna (participants, supervisors, admins)
- `units` - Unit organisasi/departemen
- `attendances` - Catatan kehadiran harian
- `monitoring_locations` - Permintaan check-in lokasi khusus

---

## Tables

### 1. `users`

Menyimpan semua data pengguna termasuk participants, supervisors, dan admins.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email pengguna |
| `name` | VARCHAR(255) | NOT NULL | Nama lengkap |
| `role` | ENUM | DEFAULT 'participant' | Role: participant, supervisor, admin |
| `unit_id` | UUID | FOREIGN KEY → units(id) | Unit/departemen pengguna |
| `status` | ENUM | DEFAULT 'active' | Status: active, inactive |
| `internship_start` | DATE | NULLABLE | Tanggal mulai magang |
| `internship_end` | DATE | NULLABLE | Tanggal selesai magang |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Waktu pembuatan record |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Waktu update terakhir |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_role` on `role`
- `idx_users_unit_id` on `unit_id`
- `idx_users_status` on `status`

**Example:**
```sql
SELECT * FROM users WHERE role = 'participant' AND status = 'active';
```

---

### 2. `units`

Menyimpan data unit organisasi atau departemen.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `name` | VARCHAR(255) | NOT NULL | Nama unit/departemen |
| `department` | VARCHAR(255) | NOT NULL | Kategori departemen |
| `manager_id` | UUID | FOREIGN KEY → users(id) | ID supervisor/manager |
| `status` | ENUM | DEFAULT 'active' | Status: active, inactive |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Waktu pembuatan record |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Waktu update terakhir |

**Indexes:**
- `idx_units_status` on `status`
- `idx_units_department` on `department`

**Example:**
```sql
SELECT u.*, m.name as manager_name 
FROM units u 
LEFT JOIN users m ON u.manager_id = m.id 
WHERE u.status = 'active';
```

---

### 3. `attendances`

Menyimpan catatan kehadiran harian dengan waktu check-in/out.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `user_id` | UUID | FOREIGN KEY → users(id), NOT NULL | ID pengguna |
| `date` | DATE | NOT NULL | Tanggal kehadiran |
| `check_in_time` | TIME | NULLABLE | Waktu check-in |
| `check_out_time` | TIME | NULLABLE | Waktu check-out |
| `activity_description` | TEXT | NULLABLE | Deskripsi aktivitas |
| `status` | ENUM | DEFAULT 'present' | Status: present, absent, late, excused |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Waktu pembuatan record |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Waktu update terakhir |

**Constraints:**
- UNIQUE(`user_id`, `date`) - Satu user hanya bisa punya satu attendance per hari

**Indexes:**
- `idx_attendances_user_id` on `user_id`
- `idx_attendances_date` on `date`
- `idx_attendances_status` on `status`

**Example:**
```sql
-- Get today's attendances
SELECT a.*, u.name as user_name 
FROM attendances a 
JOIN users u ON a.user_id = u.id 
WHERE a.date = CURRENT_DATE;
```

---

### 4. `monitoring_locations`

Menyimpan permintaan check-in dari lokasi khusus (di luar area kantor).

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `user_id` | UUID | FOREIGN KEY → users(id), NOT NULL | ID pengguna |
| `location_name` | VARCHAR(255) | NOT NULL | Nama lokasi |
| `latitude` | DECIMAL(10,8) | NULLABLE | Koordinat latitude |
| `longitude` | DECIMAL(11,8) | NULLABLE | Koordinat longitude |
| `request_date` | DATE | NOT NULL | Tanggal permintaan |
| `reason` | TEXT | NULLABLE | Alasan permintaan |
| `status` | ENUM | DEFAULT 'pending' | Status: pending, approved, rejected |
| `notes` | TEXT | NULLABLE | Catatan dari supervisor/admin |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Waktu pembuatan record |

**Indexes:**
- `idx_monitoring_user_id` on `user_id`
- `idx_monitoring_status` on `status`
- `idx_monitoring_request_date` on `request_date`

**Example:**
```sql
-- Get pending monitoring requests
SELECT m.*, u.name as user_name 
FROM monitoring_locations m 
JOIN users u ON m.user_id = u.id 
WHERE m.status = 'pending' 
ORDER BY m.created_at DESC;
```

---

## Views

### 1. `dashboard_stats`

View untuk statistik dashboard admin.

**Columns:**
- `total_participants` - Total participant aktif
- `total_supervisors` - Total supervisor aktif
- `total_units` - Total unit aktif
- `today_present` - Total kehadiran hari ini

**Query:**
```sql
SELECT * FROM dashboard_stats;
```

**Result Example:**
```
total_participants | total_supervisors | total_units | today_present
-------------------|-------------------|-------------|---------------
        10         |         3         |      5      |       7
```

---

### 2. `unit_employee_counts`

View untuk menghitung jumlah karyawan per unit.

**Columns:**
- `id` - ID unit
- `name` - Nama unit
- `department` - Departemen
- `employee_count` - Jumlah karyawan aktif

**Query:**
```sql
SELECT * FROM unit_employee_counts ORDER BY employee_count DESC;
```

---

## Relationships

```
┌─────────────┐
│    units    │
└──────┬──────┘
       │
       │ manager_id (FK)
       │
       ▼
┌─────────────┐         ┌──────────────────┐
│    users    │◄────────│   attendances    │
└──────┬──────┘         └──────────────────┘
       │                user_id (FK)
       │
       │ unit_id (FK)
       │
       ▼
┌─────────────┐         ┌──────────────────────────┐
│    units    │◄────────│  monitoring_locations    │
└─────────────┘         └──────────────────────────┘
                        user_id (FK)
```

**Relationship Details:**

1. **users ↔ units**
   - One unit has many users (one-to-many)
   - One user belongs to one unit (many-to-one)

2. **users ↔ units (manager)**
   - One user can manage one unit (one-to-one)
   - One unit has one manager (one-to-one)

3. **users ↔ attendances**
   - One user has many attendances (one-to-many)
   - One attendance belongs to one user (many-to-one)

4. **users ↔ monitoring_locations**
   - One user has many monitoring requests (one-to-many)
   - One monitoring request belongs to one user (many-to-one)

---

## Row Level Security (RLS)

Semua tabel menggunakan Row Level Security untuk keamanan data.

### Policies Overview

#### **Admin**
- ✅ Full access ke semua tabel
- ✅ Bisa create, read, update, delete semua data

#### **Supervisor**
- ✅ View users di unit mereka
- ✅ View dan update attendances di unit mereka
- ✅ View dan update monitoring requests di unit mereka
- ❌ Tidak bisa akses data unit lain

#### **Participant**
- ✅ View dan update data mereka sendiri
- ✅ Create attendance mereka sendiri
- ✅ Create monitoring request mereka sendiri
- ❌ Tidak bisa akses data user lain

### Example Policies

**Users Table - Supervisor Policy:**
```sql
CREATE POLICY "Supervisors can view users in their unit"
ON users FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
        AND u.role = 'supervisor'
        AND u.unit_id = users.unit_id
    )
);
```

---

## Indexes

Indexes dibuat untuk optimasi query performance:

### Performance Indexes

1. **users table:**
   - `idx_users_email` - Untuk login dan pencarian email
   - `idx_users_role` - Untuk filter by role
   - `idx_users_unit_id` - Untuk join dengan units
   - `idx_users_status` - Untuk filter active/inactive

2. **attendances table:**
   - `idx_attendances_user_id` - Untuk join dengan users
   - `idx_attendances_date` - Untuk filter by date range
   - `idx_attendances_status` - Untuk filter by status

3. **monitoring_locations table:**
   - `idx_monitoring_user_id` - Untuk join dengan users
   - `idx_monitoring_status` - Untuk filter pending/approved
   - `idx_monitoring_request_date` - Untuk filter by date

---

## Common Queries

### 1. Get User with Unit Info
```sql
SELECT 
    u.*,
    un.name as unit_name,
    un.department
FROM users u
LEFT JOIN units un ON u.unit_id = un.id
WHERE u.id = 'user-uuid-here';
```

### 2. Get Today's Attendance Summary
```sql
SELECT 
    status,
    COUNT(*) as count
FROM attendances
WHERE date = CURRENT_DATE
GROUP BY status;
```

### 3. Get Pending Monitoring Requests with User Info
```sql
SELECT 
    m.*,
    u.name as user_name,
    u.email,
    un.name as unit_name
FROM monitoring_locations m
JOIN users u ON m.user_id = u.id
LEFT JOIN units un ON u.unit_id = un.id
WHERE m.status = 'pending'
ORDER BY m.created_at DESC;
```

### 4. Get Attendance Report by Unit
```sql
SELECT 
    un.name as unit_name,
    COUNT(DISTINCT a.user_id) as total_users,
    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count
FROM attendances a
JOIN users u ON a.user_id = u.id
JOIN units un ON u.unit_id = un.id
WHERE a.date BETWEEN '2026-01-01' AND '2026-01-31'
GROUP BY un.id, un.name;
```

---

## Triggers

### `update_updated_at_column`

Automatically update `updated_at` timestamp pada setiap UPDATE.

**Applied to:**
- users
- units
- attendances

**Function:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Best Practices

1. **Selalu gunakan transactions** untuk operasi yang melibatkan multiple tables
2. **Gunakan prepared statements** untuk mencegah SQL injection
3. **Leverage RLS policies** - jangan bypass dengan service role key di client
4. **Index foreign keys** untuk performa join yang optimal
5. **Gunakan views** untuk query kompleks yang sering digunakan
6. **Regular backup** - Supabase auto backup daily, tapi buat manual backup untuk production

---

## Migration Guide

Jika perlu update schema di production:

1. **Test di development** terlebih dahulu
2. **Backup database** sebelum migration
3. **Gunakan transactions** untuk rollback jika error
4. **Update RLS policies** jika ada perubahan struktur
5. **Regenerate TypeScript types** setelah migration

```bash
# Generate types from Supabase
npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/database.types.ts
```

---

## Support

Untuk pertanyaan atau issue terkait database:
1. Check [Supabase Documentation](https://supabase.com/docs)
2. Check project README dan TECHNICAL_HANDBOOK
3. Contact team lead atau database administrator
