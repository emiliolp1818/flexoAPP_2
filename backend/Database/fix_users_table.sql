-- Fix users table schema to match entity expectations
USE flexoapp_db;

-- Add missing columns if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS area VARCHAR(100),
ADD COLUMN IF NOT EXISTS permissions JSON,
ADD COLUMN IF NOT EXISTS profile_image LONGTEXT,
ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing admin user with required fields
UPDATE users 
SET 
    display_name = COALESCE(display_name, 'Admin'),
    full_name = COALESCE(full_name, 'Administrador del Sistema'),
    area = COALESCE(area, 'Sistemas'),
    permissions = COALESCE(permissions, '["read", "write", "delete", "admin"]'),
    CreatedAt = COALESCE(CreatedAt, NOW()),
    UpdatedAt = COALESCE(UpdatedAt, NOW())
WHERE user_code = 'admin';

-- Show the updated table structure
DESCRIBE users;

-- Show current users
SELECT id, user_code, display_name, full_name, area, role, is_active FROM users;