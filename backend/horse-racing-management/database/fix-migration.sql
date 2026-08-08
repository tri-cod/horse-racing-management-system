BEGIN;

-- 1) Seed 4 roles thiếu
INSERT INTO roles (RoleName, description) VALUES
    ('HORSE_OWNER', 'Horse Owner'),
    ('TRAINER',     'Horse Trainer'),
    ('REFEREE',     'Race Referee'),
    ('SPECTATOR',   'Spectator')
ON CONFLICT (RoleName) DO NOTHING;

-- 2) Fix race.status
UPDATE race SET status = 'UPCOMING'            WHERE status IN ('Upcoming', 'upcoming');
UPDATE race SET status = 'ONGOING'             WHERE status IN ('Ongoing', 'ongoing');
UPDATE race SET status = 'FINISHED'            WHERE status IN ('Finished', 'finished');
UPDATE race SET status = 'CANCELLED'           WHERE status IN ('Cancelled', 'cancelled');
UPDATE race SET status = 'OPEN_REGISTRATION'   WHERE status IN ('Open_Registration', 'open_registration');
UPDATE race SET status = 'CLOSED_REGISTRATION' WHERE status IN ('Closed_Registration', 'closed_registration');
UPDATE race SET status = 'UPCOMING'
WHERE status IS NULL OR status NOT IN ('UPCOMING','OPEN_REGISTRATION','CLOSED_REGISTRATION','ONGOING','FINISHED','CANCELLED');
ALTER TABLE race ALTER COLUMN status SET DEFAULT 'UPCOMING';

-- 3) Fix horse.status
UPDATE horse SET status = 'ACTIVE'   WHERE status IN ('Active', 'active');
UPDATE horse SET status = 'INACTIVE' WHERE status IN ('Inactive', 'inactive');
UPDATE horse SET status = 'RETIRE'   WHERE status IN ('Retire', 'retire');
UPDATE horse SET status = 'ACTIVE'
WHERE status IS NULL OR status NOT IN ('ACTIVE','INACTIVE','RETIRE');
ALTER TABLE horse ALTER COLUMN status SET DEFAULT 'ACTIVE';

-- 4) Fix users.status (defensive)
UPDATE users SET status = 'ACTIVE'   WHERE status IN ('Active', 'active');
UPDATE users SET status = 'INACTIVE' WHERE status IN ('Inactive', 'inactive');
UPDATE users SET status = 'BANNED'   WHERE status IN ('Banned', 'banned');

-- 5) Backfill wallet cho users chưa có
INSERT INTO wallet (user_id, balance)
SELECT u.user_id, 0
FROM users u
LEFT JOIN wallet w ON w.user_id = u.user_id
WHERE w.user_id IS NULL;

COMMIT;

-- Số giây "chấp" của mỗi ngựa trong 1 race — do referee set trước khi race bắt đầu
ALTER TABLE race_horse ADD COLUMN IF NOT EXISTS handicap_seconds DOUBLE PRECISION DEFAULT 0;

-- Snapshot số giây handicap đã áp dụng khi kết quả được chốt (để tra cứu lại sau này)
ALTER TABLE race_result ADD COLUMN IF NOT EXISTS applied_handicap_seconds DOUBLE PRECISION;

-- 2. Tạo user admin (bỏ qua nếu username 'admin' đã tồn tại)
INSERT INTO users (role_id, email, username, password, full_name, phonenumber, status, verified, created_at, updated_at)
SELECT r.id,
       'admin@horseracing.local',
       'admin',
       '$2b$10$QGd7L7CxJzYKReU.7I2x9O30J0b0Gb3FAQuixXdUe.5t.yuw34q9m',
       'Administrator',
       '0900000000',
       'ACTIVE',
       true,
       now(),
       now()
FROM roles r
WHERE r.rolename = 'ADMIN'
  AND NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- 3. Tạo wallet cho admin — bắt buộc, vì register() luôn tạo wallet kèm theo user,
--    nhiều chỗ trong code (vd getStats(), buildCurrentUser()) đọc wallet của user.
INSERT INTO wallet (user_id, balance)
SELECT u.user_id, 0
FROM users u
WHERE u.username = 'admin'
  AND NOT EXISTS (SELECT 1 FROM wallet w WHERE w.user_id = u.user_id);

-- 2. Tạo user referee1
INSERT INTO users (role_id, email, username, password, full_name, phonenumber, status, verified, created_at, updated_at)
SELECT r.id,
       'referee2@horseracing.local',
       'referee2',
       '$2a$12$zbrdXcoGvYoB3tl0HwoizuYHoWPHPlyucj5v1olHPZwqiAZ/CH8bS',
       'Referee2',
       '0123456789',
       'ACTIVE',
       true,
       now(),
       now()
FROM roles r
WHERE r.rolename = 'REFEREE'
  AND NOT EXISTS (SELECT 1 FROM users WHERE username = 'referee2');

-- 3. Tạo wallet cho user này
INSERT INTO wallet (user_id, balance)
SELECT u.user_id, 0
FROM users u
WHERE u.username = 'referee2'
  AND NOT EXISTS (SELECT 1 FROM wallet w WHERE w.user_id = u.user_id);

-- 4. Tạo profile race_referee tương ứng — bắt buộc, vì mọi API /referee/* đều cần bản ghi này
INSERT INTO race_referee (user_id, status)
SELECT u.user_id, 'Active'
FROM users u
WHERE u.username = 'referee2'
  AND NOT EXISTS (SELECT 1 FROM race_referee rr WHERE rr.user_id = u.user_id);

SELECT user_id, username, email, password, status, verified, role_id
FROM users
WHERE username = 'referee2';

