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
