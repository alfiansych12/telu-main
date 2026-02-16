-- Migration: Add telegram_username to users table
-- This allows supervisors to receive Telegram notifications

-- Add telegram_username column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_username ON users(telegram_username);

-- Add comment
COMMENT ON COLUMN users.telegram_username IS 'Telegram username untuk notifikasi (tanpa @)';
