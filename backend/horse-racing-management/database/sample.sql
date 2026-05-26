
-- =========================
-- ROLES SAMPLE DATA
-- =========================

INSERT INTO roles (RoleName, description)
VALUES
    ('ADMIN', 'System administrator'),
    ('MANAGER', 'Stable manager'),
    ('STAFF', 'Stable staff'),
    ('USER', 'Normal user');






-- =========================
-- USERS SAMPLE DATA
-- =========================

INSERT INTO users (
    role_id,
    email,
    userName,
    password,
    full_name,
    phoneNumber,
    avatar_url,
    status,
    created_at,
    updated_at
)
VALUES
    (
        4,
        'admin@gmail.com',
        'admin',
        '123456',
        'System Admin',
        '0901111111',
        'https://example.com/admin.png',
        'ACTIVE',
        NOW(),
        NOW()
    ),
    (
        5,
        'manager@gmail.com',
        'manager01',
        '123456',
        'Stable Manager',
        '0902222222',
        'https://example.com/manager.png',
        'ACTIVE',
        NOW(),
        NOW()
    ),
    (
        6,
        'staff@gmail.com',
        'staff01',
        '123456',
        'Stable Staff',
        '0903333333',
        'https://example.com/staff.png',
        'ACTIVE',
        NOW(),
        NOW()
    ),
    (
        7,
        'user@gmail.com',
        'user01',
        '123456',
        'Normal User',
        '0904444444',
        'https://example.com/user.png',
        'ACTIVE',
        NOW(),
        NOW()
    );

