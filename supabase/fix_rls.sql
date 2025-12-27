-- ============================================================================
-- FINAL FIX (GLOBAL ADMIN GRANT)
-- ============================================================================
-- Script ini akan memaksa SEMUA user yang terdaftar untuk memiliki role ADMIN.
-- Ini memastikan akun aplikasi Anda pasti punya akses.
-- ============================================================================

-- 1. BERSIHKAN POLICY LAMA
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'users' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', pol.policyname);
    END LOOP;
END $$;
-- Drop policies table lain aman
DROP POLICY IF EXISTS "Admins Full Access" ON users;
DROP POLICY IF EXISTS "Auth Insert" ON users;
DROP POLICY IF EXISTS "Admins Manage Units" ON units;
DROP POLICY IF EXISTS "Public View Units" ON units;
DROP POLICY IF EXISTS "Admins Manage Attendances" ON attendances;
DROP POLICY IF EXISTS "Self Manage Attendances" ON attendances;

-- 2. UPDATE METADATA GLOBAL (SEMUA USER JADI ADMIN)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
);

-- 3. BOOTSTRAP PUBLIC USERS (Pastikan data ada di tabel public)
INSERT INTO public.users (id, email, name, role, status)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', 'Dev Admin'), 
    'admin', 
    'active'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'admin', status = 'active';

-- 4. RECREATE POLICIES (JWT Strategy)

-- Users Table
CREATE POLICY "Admins Full Access"
    ON users
    FOR ALL
    USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

CREATE POLICY "Self View"
    ON users
    FOR SELECT
    USING ( id = auth.uid() );

CREATE POLICY "Auth Insert"
    ON users
    FOR INSERT
    WITH CHECK ( auth.role() = 'authenticated' );

-- Units Table
CREATE POLICY "Admins Manage Units"
    ON units
    FOR ALL
    USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

CREATE POLICY "Public View Units"
    ON units
    FOR SELECT
    USING (true);

-- Attendances Table
CREATE POLICY "Admins Manage Attendances"
    ON attendances
    FOR ALL
    USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

CREATE POLICY "Self Manage Attendances"
    ON attendances
    FOR ALL
    USING ( user_id = auth.uid() );
