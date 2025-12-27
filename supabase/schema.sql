-- ============================================================================
-- SUPABASE DATABASE SCHEMA
-- Project: Puti - Internship Management System
-- Created: 2025-12-24
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Role enum untuk user types
CREATE TYPE user_role AS ENUM ('participant', 'supervisor', 'admin');

-- Status enum untuk users dan units
CREATE TYPE entity_status AS ENUM ('active', 'inactive');

-- Attendance status enum
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');

-- Request status enum untuk monitoring locations
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Table: units (Departments/Units in organization)
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    manager_id UUID, -- Foreign key akan ditambahkan setelah table users dibuat
    status entity_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: users (Participants, Supervisors, Admins)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'participant',
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    status entity_status DEFAULT 'active',
    internship_start DATE,
    internship_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for manager_id in units table
ALTER TABLE units
ADD CONSTRAINT fk_units_manager
FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- Table: attendances (Check-in, check-out records)
CREATE TABLE attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    activity_description TEXT,
    status attendance_status DEFAULT 'present',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: monitoring_locations (Special location check-in requests)
CREATE TABLE monitoring_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    request_date DATE NOT NULL,
    status request_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_unit_id ON users(unit_id);
CREATE INDEX idx_users_status ON users(status);

-- Units indexes
CREATE INDEX idx_units_manager_id ON units(manager_id);
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_units_department ON units(department);

-- Attendances indexes
CREATE INDEX idx_attendances_user_id ON attendances(user_id);
CREATE INDEX idx_attendances_date ON attendances(date);
CREATE INDEX idx_attendances_status ON attendances(status);
CREATE INDEX idx_attendances_user_date ON attendances(user_id, date);

-- Monitoring locations indexes
CREATE INDEX idx_monitoring_user_id ON monitoring_locations(user_id);
CREATE INDEX idx_monitoring_status ON monitoring_locations(status);
CREATE INDEX idx_monitoring_date ON monitoring_locations(request_date);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at
    BEFORE UPDATE ON units
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendances_updated_at
    BEFORE UPDATE ON attendances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_locations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES for USERS table
-- ============================================================================

-- Admins can do everything
CREATE POLICY "Admins have full access to users"
    ON users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Supervisors can view all users in their unit
CREATE POLICY "Supervisors can view users in their unit"
    ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'supervisor'
            AND u.unit_id = users.unit_id
        )
    );

-- Users can view their own data
CREATE POLICY "Users can view their own data"
    ON users
    FOR SELECT
    USING (id = auth.uid());

-- ============================================================================
-- POLICIES for UNITS table
-- ============================================================================

-- Admins have full access
CREATE POLICY "Admins have full access to units"
    ON units
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Everyone can view units
CREATE POLICY "Everyone can view units"
    ON units
    FOR SELECT
    USING (true);

-- ============================================================================
-- POLICIES for ATTENDANCES table
-- ============================================================================

-- Admins have full access
CREATE POLICY "Admins have full access to attendances"
    ON attendances
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Supervisors can view attendances in their unit
CREATE POLICY "Supervisors can view attendances in their unit"
    ON attendances
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u1
            JOIN users u2 ON u1.unit_id = u2.unit_id
            WHERE u1.id = auth.uid()
            AND u1.role = 'supervisor'
            AND u2.id = attendances.user_id
        )
    );

-- Users can view and create their own attendances
CREATE POLICY "Users can view their own attendances"
    ON attendances
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own attendances"
    ON attendances
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- POLICIES for MONITORING_LOCATIONS table
-- ============================================================================

-- Admins have full access
CREATE POLICY "Admins have full access to monitoring locations"
    ON monitoring_locations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Supervisors can view and approve/reject requests
CREATE POLICY "Supervisors can manage monitoring requests"
    ON monitoring_locations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u1
            JOIN users u2 ON u1.unit_id = u2.unit_id
            WHERE u1.id = auth.uid()
            AND u1.role = 'supervisor'
            AND u2.id = monitoring_locations.user_id
        )
    );

-- Users can view and create their own requests
CREATE POLICY "Users can view their own monitoring requests"
    ON monitoring_locations
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create monitoring requests"
    ON monitoring_locations
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- VIEWS for Statistics
-- ============================================================================

-- View: Dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM users WHERE role = 'participant' AND status = 'active') as total_participants,
    (SELECT COUNT(*) FROM users WHERE role = 'supervisor' AND status = 'active') as total_supervisors,
    (SELECT COUNT(*) FROM units WHERE status = 'active') as total_units,
    (SELECT COUNT(*) FROM attendances WHERE date = CURRENT_DATE AND status = 'present') as today_present;

-- View: Unit employee count
CREATE OR REPLACE VIEW unit_employee_counts AS
SELECT
    u.id,
    u.name,
    u.department,
    COUNT(us.id) as employee_count
FROM units u
LEFT JOIN users us ON u.id = us.unit_id AND us.status = 'active'
GROUP BY u.id, u.name, u.department;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'Stores user information for participants, supervisors, and admins';
COMMENT ON TABLE units IS 'Stores organizational units/departments';
COMMENT ON TABLE attendances IS 'Stores daily check-in/check-out records';
COMMENT ON TABLE monitoring_locations IS 'Stores special location check-in requests';

COMMENT ON COLUMN users.role IS 'User role: participant, supervisor, or admin';
COMMENT ON COLUMN users.internship_start IS 'Start date of internship period';
COMMENT ON COLUMN users.internship_end IS 'End date of internship period';

-- ============================================================================
-- GRANTS (Optional - configure based on your needs)
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant access to sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
