-- ============================================================================
-- SAMPLE DATA (SEED)
-- Project: Puti - Internship Management System
-- Created: 2025-12-24
-- Purpose: Sample data untuk testing dan development
-- ============================================================================

-- ============================================================================
-- UNITS - Sample organizational units
-- ============================================================================

INSERT INTO units (id, name, department, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'IT Development', 'Information Technology', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'HR Operations', 'Human Resources', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'Marketing Team', 'Marketing & Communications', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 'Finance Department', 'Finance & Accounting', 'inactive');

-- ============================================================================
-- USERS - Sample participants, supervisors, and admin
-- ============================================================================

-- Admin User
INSERT INTO users (id, email, name, role, unit_id, status, internship_start, internship_end) VALUES
('550e8400-e29b-41d4-a716-446655440100', 'admin@putiapp.com', 'Admin System', 'admin', NULL, 'active', NULL, NULL);

-- Supervisors
INSERT INTO users (id, email, name, role, unit_id, status, internship_start, internship_end) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'budi.santoso@company.com', 'Budi Santoso', 'supervisor', '550e8400-e29b-41d4-a716-446655440001', 'active', NULL, NULL),
('550e8400-e29b-41d4-a716-446655440102', 'siti.rahman@company.com', 'Siti Rahman', 'supervisor', '550e8400-e29b-41d4-a716-446655440002', 'active', NULL, NULL),
('550e8400-e29b-41d4-a716-446655440103', 'ahmad.wijaya@company.com', 'Ahmad Wijaya', 'supervisor', '550e8400-e29b-41d4-a716-446655440003', 'active', NULL, NULL),
('550e8400-e29b-41d4-a716-446655440104', 'rina.putri@company.com', 'Rina Putri', 'supervisor', '550e8400-e29b-41d4-a716-446655440001', 'active', NULL, NULL);

-- Update units dengan manager_id
UPDATE units SET manager_id = '550e8400-e29b-41d4-a716-446655440101' WHERE id = '550e8400-e29b-41d4-a716-446655440001';
UPDATE units SET manager_id = '550e8400-e29b-41d4-a716-446655440102' WHERE id = '550e8400-e29b-41d4-a716-446655440002';
UPDATE units SET manager_id = '550e8400-e29b-41d4-a716-446655440103' WHERE id = '550e8400-e29b-41d4-a716-446655440003';

-- Participants (Interns)
INSERT INTO users (id, email, name, role, unit_id, status, internship_start, internship_end) VALUES
('550e8400-e29b-41d4-a716-446655440201', 'andi.pratama@student.com', 'Andi Pratama', 'participant', '550e8400-e29b-41d4-a716-446655440001', 'active', '2025-01-15', '2025-04-15'),
('550e8400-e29b-41d4-a716-446655440202', 'dewi.lestari@student.com', 'Dewi Lestari', 'participant', '550e8400-e29b-41d4-a716-446655440001', 'active', '2025-01-15', '2025-04-15'),
('550e8400-e29b-41d4-a716-446655440203', 'reza.firmansyah@student.com', 'Reza Firmansyah', 'participant', '550e8400-e29b-41d4-a716-446655440002', 'active', '2025-02-01', '2025-05-01'),
('550e8400-e29b-41d4-a716-446655440204', 'maya.sari@student.com', 'Maya Sari', 'participant', '550e8400-e29b-41d4-a716-446655440002', 'active', '2025-02-01', '2025-05-01'),
('550e8400-e29b-41d4-a716-446655440205', 'fajar.nugroho@student.com', 'Fajar Nugroho', 'participant', '550e8400-e29b-41d4-a716-446655440003', 'active', '2025-01-20', '2025-04-20'),
('550e8400-e29b-41d4-a716-446655440206', 'linda.wahyuni@student.com', 'Linda Wahyuni', 'participant', '550e8400-e29b-41d4-a716-446655440003', 'active', '2025-01-20', '2025-04-20'),
('550e8400-e29b-41d4-a716-446655440207', 'dimas.saputra@student.com', 'Dimas Saputra', 'participant', '550e8400-e29b-41d4-a716-446655440001', 'active', '2025-03-01', '2025-06-01'),
('550e8400-e29b-41d4-a716-446655440208', 'nur.azizah@student.com', 'Nur Azizah', 'participant', '550e8400-e29b-41d4-a716-446655440002', 'inactive', '2024-11-01', '2025-02-01'),
('550e8400-e29b-41d4-a716-446655440209', 'rizki.hidayat@student.com', 'Rizki Hidayat', 'participant', '550e8400-e29b-41d4-a716-446655440001', 'active', '2025-02-10', '2025-05-10'),
('550e8400-e29b-41d4-a716-446655440210', 'putri.amanda@student.com', 'Putri Amanda', 'participant', '550e8400-e29b-41d4-a716-446655440003', 'active', '2025-02-15', '2025-05-15');

-- ============================================================================
-- ATTENDANCES - Sample attendance records (last 7 days)
-- ============================================================================

-- Andi Pratama - IT Development
INSERT INTO attendances (user_id, date, check_in_time, check_out_time, activity_description, status) VALUES
('550e8400-e29b-41d4-a716-446655440201', '2025-12-17', '08:00:00', '17:00:00', 'Mengerjakan project web development', 'present'),
('550e8400-e29b-41d4-a716-446655440201', '2025-12-18', '08:05:00', '17:10:00', 'Testing fitur authentication', 'present'),
('550e8400-e29b-41d4-a716-446655440201', '2025-12-19', '08:15:00', '17:05:00', 'Meeting dengan supervisor', 'late'),
('550e8400-e29b-41d4-a716-446655440201', '2025-12-20', '08:00:00', '17:00:00', 'Code review dan debugging', 'present'),
('550e8400-e29b-41d4-a716-446655440201', '2025-12-23', '08:00:00', '17:00:00', 'Implementasi fitur baru', 'present'),
('550e8400-e29b-41d4-a716-446655440201', '2025-12-24', '08:00:00', NULL, 'Deploy aplikasi ke staging', 'present');

-- Dewi Lestari - IT Development
INSERT INTO attendances (user_id, date, check_in_time, check_out_time, activity_description, status) VALUES
('550e8400-e29b-41d4-a716-446655440202', '2025-12-17', '08:10:00', '17:00:00', 'UI/UX design implementation', 'present'),
('550e8400-e29b-41d4-a716-446655440202', '2025-12-18', '08:00:00', '17:00:00', 'Responsive design fixing', 'present'),
('550e8400-e29b-41d4-a716-446655440202', '2025-12-19', NULL, NULL, 'Sakit', 'excused'),
('550e8400-e29b-41d4-a716-446655440202', '2025-12-20', '08:05:00', '17:00:00', 'Component development', 'present'),
('550e8400-e29b-41d4-a716-446655440202', '2025-12-23', '08:00:00', '17:00:00', 'Integration testing', 'present'),
('550e8400-e29b-41d4-a716-446655440202', '2025-12-24', '08:00:00', NULL, 'Documentation update', 'present');

-- Reza Firmansyah - HR Operations
INSERT INTO attendances (user_id, date, check_in_time, check_out_time, activity_description, status) VALUES
('550e8400-e29b-41d4-a716-446655440203', '2025-12-17', '08:00:00', '17:00:00', 'Training documentation', 'present'),
('550e8400-e29b-41d4-a716-446655440203', '2025-12-18', '08:30:00', '17:00:00', 'Employee onboarding support', 'late'),
('550e8400-e29b-41d4-a716-446655440203', '2025-12-19', '08:00:00', '17:00:00', 'Interview preparation', 'present'),
('550e8400-e29b-41d4-a716-446655440203', '2025-12-20', '08:00:00', '17:00:00', 'Recruitment data analysis', 'present'),
('550e8400-e29b-41d4-a716-446655440203', '2025-12-23', '08:00:00', '17:00:00', 'Meeting dengan team HR', 'present'),
('550e8400-e29b-41d4-a716-446655440203', '2025-12-24', '08:00:00', NULL, 'Updating employee database', 'present');

-- Maya Sari - HR Operations
INSERT INTO attendances (user_id, date, check_in_time, check_out_time, activity_description, status) VALUES
('550e8400-e29b-41d4-a716-446655440204', '2025-12-17', '08:00:00', '17:00:00', 'Performance review analysis', 'present'),
('550e8400-e29b-41d4-a716-446655440204', '2025-12-18', '08:00:00', '17:00:00', 'Training material preparation', 'present'),
('550e8400-e29b-41d4-a716-446655440204', '2025-12-19', '08:00:00', '17:00:00', 'Employee engagement survey', 'present'),
('550e8400-e29b-41d4-a716-446655440204', '2025-12-20', NULL, NULL, 'Izin', 'excused'),
('550e8400-e29b-41d4-a716-446655440204', '2025-12-23', '08:00:00', '17:00:00', 'Policy documentation', 'present'),
('550e8400-e29b-41d4-a716-446655440204', '2025-12-24', '08:00:00', NULL, 'Benefits administration', 'present');

-- Fajar Nugroho - Marketing Team
INSERT INTO attendances (user_id, date, check_in_time, check_out_time, activity_description, status) VALUES
('550e8400-e29b-41d4-a716-446655440205', '2025-12-17', '08:00:00', '17:00:00', 'Social media content creation', 'present'),
('550e8400-e29b-41d4-a716-446655440205', '2025-12-18', '08:00:00', '17:00:00', 'Campaign analytics review', 'present'),
('550e8400-e29b-41d4-a716-446655440205', '2025-12-19', '08:20:00', '17:00:00', 'Client meeting preparation', 'late'),
('550e8400-e29b-41d4-a716-446655440205', '2025-12-20', '08:00:00', '17:00:00', 'Marketing strategy brainstorm', 'present'),
('550e8400-e29b-41d4-a716-446655440205', '2025-12-23', '08:00:00', '17:00:00', 'Content calendar planning', 'present'),
('550e8400-e29b-41d4-a716-446655440205', '2025-12-24', '08:00:00', NULL, 'Email campaign setup', 'present');

-- Linda Wahyuni - Marketing Team
INSERT INTO attendances (user_id, date, check_in_time, check_out_time, activity_description, status) VALUES
('550e8400-e29b-41d4-a716-446655440206', '2025-12-17', '08:00:00', '17:00:00', 'Market research analysis', 'present'),
('550e8400-e29b-41d4-a716-446655440206', '2025-12-18', '08:00:00', '17:00:00', 'Competitor analysis report', 'present'),
('550e8400-e29b-41d4-a716-446655440206', '2025-12-19', '08:00:00', '17:00:00', 'Brand positioning strategy', 'present'),
('550e8400-e29b-41d4-a716-446655440206', '2025-12-20', '08:00:00', '17:00:00', 'Customer feedback analysis', 'present'),
('550e8400-e29b-41d4-a716-446655440206', '2025-12-23', '08:00:00', '17:00:00', 'Presentation preparation', 'present'),
('550e8400-e29b-41d4-a716-446655440206', '2025-12-24', '08:00:00', NULL, 'Meeting dengan client', 'present');

-- Dimas Saputra - IT Development
INSERT INTO attendances (user_id, date, check_in_time, check_out_time, activity_description, status) VALUES
('550e8400-e29b-41d4-a716-446655440207', '2025-12-17', '08:00:00', '17:00:00', 'Database optimization', 'present'),
('550e8400-e29b-41d4-a716-446655440207', '2025-12-18', '08:00:00', '17:00:00', 'API development', 'present'),
('550e8400-e29b-41d4-a716-446655440207', '2025-12-19', '08:00:00', '17:00:00', 'Security audit', 'present'),
('550e8400-e29b-41d4-a716-446655440207', '2025-12-20', '08:10:00', '17:00:00', 'System monitoring setup', 'present'),
('550e8400-e29b-41d4-a716-446655440207', '2025-12-23', NULL, NULL, 'Tanpa keterangan', 'absent'),
('550e8400-e29b-41d4-a716-446655440207', '2025-12-24', '08:00:00', NULL, 'Bug fixing', 'present');

-- Rizki Hidayat - IT Development  
INSERT INTO attendances (user_id, date, check_in_time, check_out_time, activity_description, status) VALUES
('550e8400-e29b-41d4-a716-446655440209', '2025-12-17', '08:00:00', '17:00:00', 'Frontend development', 'present'),
('550e8400-e29b-41d4-a716-446655440209', '2025-12-18', '08:00:00', '17:00:00', 'State management implementation', 'present'),
('550e8400-e29b-41d4-a716-446655440209', '2025-12-19', '08:00:00', '17:00:00', 'Performance optimization', 'present'),
('550e8400-e29b-41d4-a716-446655440209', '2025-12-20', '08:00:00', '17:00:00', 'Unit testing', 'present'),
('550e8400-e29b-41d4-a716-446655440209', '2025-12-23', '08:00:00', '17:00:00', 'Code refactoring', 'present'),
('550e8400-e29b-41d4-a716-446655440209', '2025-12-24', '08:00:00', NULL, 'Feature development', 'present');

-- Putri Amanda - Marketing Team
INSERT INTO attendances (user_id, date, check_in_time, check_out_time, activity_description, status) VALUES
('550e8400-e29b-41d4-a716-446655440210', '2025-12-17', '08:00:00', '17:00:00', 'Graphic design untuk campaign', 'present'),
('550e8400-e29b-41d4-a716-446655440210', '2025-12-18', '08:00:00', '17:00:00', 'Video editing', 'present'),
('550e8400-e29b-41d4-a716-446655440210', '2025-12-19', '08:00:00', '17:00:00', 'Event planning meeting', 'present'),
('550e8400-e29b-41d4-a716-446655440210', '2025-12-20', '08:00:00', '17:00:00', 'Promotional material design', 'present'),
('550e8400-e29b-41d4-a716-446655440210', '2025-12-23', '08:00:00', '17:00:00', 'Social media scheduling', 'present'),
('550e8400-e29b-41d4-a716-446655440210', '2025-12-24', '08:00:00', NULL, 'Brand asset creation', 'present');

-- ============================================================================
-- MONITORING LOCATIONS - Sample location check-in requests
-- ============================================================================

INSERT INTO monitoring_locations (user_id, location_name, latitude, longitude, request_date, status, notes) VALUES
('550e8400-e29b-41d4-a716-446655440201', 'Client Office - Jakarta Selatan', -6.2608, 106.7813, '2025-12-20', 'approved', 'Site visit untuk demo aplikasi'),
('550e8400-e29b-41d4-a716-446655440205', 'Event Venue - Plaza Indonesia', -6.1944, 106.8229, '2025-12-18', 'approved', 'Marketing event'),
('550e8400-e29b-41d4-a716-446655440203', 'Job Fair - Universitas Indonesia', -6.3641, 106.8295, '2025-12-19', 'approved', 'Recruitment event support'),
('550e8400-e29b-41d4-a716-446655440207', 'Data Center - Cyber Building', -6.2264, 106.8046, '2025-12-23', 'pending', 'Server maintenance'),
('550e8400-e29b-41d4-a716-446655440206', 'Workshop Venue - Kemang', -6.2615, 106.8166, '2025-12-21', 'rejected', 'Tidak sesuai dengan jadwal'),
('550e8400-e29b-41d4-a716-446655440209', 'Tech Conference - ICE BSD', -6.3019, 106.6490, '2025-12-24', 'pending', 'Learning dan networking'),
('550e8400-e29b-41d4-a716-446655440210', 'Photo Shoot Location - Ancol', -6.1224, 106.8328, '2025-12-25', 'pending', 'Content creation untuk campaign');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check total users by role
-- SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Check total units with employee count
-- SELECT * FROM unit_employee_counts;

-- Check dashboard statistics
-- SELECT * FROM dashboard_stats;

-- Check recent attendances
-- SELECT u.name, a.date, a.check_in_time, a.check_out_time, a.status
-- FROM attendances a
-- JOIN users u ON a.user_id = u.id
-- ORDER BY a.date DESC, a.check_in_time DESC
-- LIMIT 20;

-- Check pending location requests
-- SELECT u.name, ml.location_name, ml.request_date, ml.status
-- FROM monitoring_locations ml
-- JOIN users u ON ml.user_id = u.id
-- WHERE ml.status = 'pending'
-- ORDER BY ml.request_date;
