-- Migration: Add notification_templates table
-- This allows admins to customize notification messages

CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key VARCHAR(100) UNIQUE NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message_template TEXT NOT NULL,
    description TEXT,
    variables JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_notification_templates_key ON notification_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);

-- Add comments
COMMENT ON TABLE notification_templates IS 'Template untuk notifikasi yang bisa dikustomisasi oleh admin';
COMMENT ON COLUMN notification_templates.template_key IS 'Unique key untuk template (e.g., attendance_reminder)';
COMMENT ON COLUMN notification_templates.message_template IS 'Template pesan dengan placeholder {variable_name}';
COMMENT ON COLUMN notification_templates.variables IS 'Daftar variabel yang tersedia untuk template';

-- Insert default template untuk attendance reminder
INSERT INTO notification_templates (
    template_key,
    template_name,
    title,
    message_template,
    description,
    variables,
    is_active
) VALUES (
    'attendance_reminder',
    'Reminder Presensi Anak Magang',
    '🔔 Notifikasi Presensi Anak Magang',
    '<b>🔔 Notifikasi Presensi Anak Magang</b>

Halo <b>{supervisor_name}</b>,

Berikut adalah daftar anak magang yang <u>belum melakukan presensi hari ini</u>:

{intern_list}

<i>Silakan cek Internship Management System untuk detail lebih lanjut.</i>

⏰ Waktu: {timestamp}',
    'Template notifikasi untuk mengingatkan supervisor tentang anak magang yang belum presensi',
    '{"supervisor_name": "Nama supervisor", "intern_list": "Daftar anak magang (auto-generated)", "timestamp": "Waktu notifikasi dikirim", "absent_count": "Jumlah anak magang yang tidak presensi"}'::jsonb,
    true
) ON CONFLICT (template_key) DO NOTHING;
