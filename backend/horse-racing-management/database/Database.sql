-- ============================================================
--  FULL DATABASE SCHEMA
--  Tổng hợp từ: data.sql + fix-sql1.sql + fix-migration.sql
--  Thứ tự: tạo bảng theo dependency, sau đó seed data
-- ============================================================

BEGIN;

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id          BIGSERIAL PRIMARY KEY,
    RoleName    VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- ============================================================
-- 2. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    user_id     BIGSERIAL PRIMARY KEY,
    role_id     BIGINT       NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    userName    VARCHAR(150) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(150),
    phoneNumber VARCHAR(20),
    avatar_url  VARCHAR(255),
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ============================================================
-- 3. FORGOT PASSWORD
-- ============================================================
CREATE TABLE IF NOT EXISTS forgot_password (
    id              BIGSERIAL PRIMARY KEY,
    otp             INT          NOT NULL,
    expiration_time TIMESTAMP,
    user_id         BIGINT       NOT NULL UNIQUE,
    CONSTRAINT fk_forgot_password_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 4. BANK ACCOUNT
-- ============================================================
CREATE TABLE IF NOT EXISTS bank_account (
    bank_account_id BIGINT PRIMARY KEY,
    user_id         BIGINT,
    bank_name       VARCHAR(150) NOT NULL,
    bank_user_name  VARCHAR(150) NOT NULL,
    bank_number     VARCHAR(150) NOT NULL,
    CONSTRAINT fk_bank_account_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ============================================================
-- 5. WALLET
-- ============================================================
CREATE TABLE IF NOT EXISTS wallet (
    id      BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_wallet_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 6. HORSE OWNER
-- ============================================================
CREATE TABLE IF NOT EXISTS horse_owner (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL UNIQUE REFERENCES users(user_id),
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    status      VARCHAR(20)
);

-- ============================================================
-- 7. TRAINER
-- ============================================================
CREATE TABLE IF NOT EXISTS trainer (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT       UNIQUE REFERENCES users(user_id),
    name             VARCHAR(150) NOT NULL,
    age              INTEGER,
    experience_years INTEGER,
    description      TEXT,
    avatar_url       VARCHAR(255),
    status           VARCHAR(20) DEFAULT 'Active'
);

-- ============================================================
-- 8. JOCKEY
-- ============================================================
CREATE TABLE IF NOT EXISTS jockey (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT UNIQUE REFERENCES users(user_id),
    age             BIGINT,
    description     TEXT,
    experience_year BIGINT,
    status          VARCHAR(20) DEFAULT 'Active'
);

-- ============================================================
-- 9. HORSE
-- ============================================================
CREATE TABLE IF NOT EXISTS horse (
    horse_id     BIGSERIAL PRIMARY KEY,
    trainer_id   BIGINT REFERENCES trainer(id),
    owner_id     BIGINT REFERENCES horse_owner(id),
    horse_name   VARCHAR(150) NOT NULL,
    breed        VARCHAR(50)  NOT NULL,
    age          INT          NOT NULL,
    speed_rating INT,
    history_rank VARCHAR(50),
    avatar_url   VARCHAR(255),
    gender       VARCHAR(20)  NOT NULL DEFAULT 'MALE',
    weight       NUMERIC(5,2),
    status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at   TIMESTAMP    DEFAULT NOW(),
    updated_at   TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- 10. RACE REFEREE
-- ============================================================
CREATE TABLE IF NOT EXISTS race_referee (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT UNIQUE REFERENCES users(user_id),
    experienceyears BIGINT,
    status          VARCHAR(20) DEFAULT 'Active'
);

-- ============================================================
-- 11. RACE
-- ============================================================
CREATE TABLE IF NOT EXISTS race (
    id                    BIGSERIAL PRIMARY KEY,
    referee_id            BIGINT REFERENCES race_referee(id),
    race_name             VARCHAR(150) NOT NULL,
    race_date             TIMESTAMP,
    start_time            TIMESTAMP,
    end_time              TIMESTAMP,
    track_name            VARCHAR(150),
    track_condition       VARCHAR(50),
    surface_type          VARCHAR(50),
    totalprizepool        BIGINT,
    distance              TEXT,
    location              VARCHAR(150),
    capacity              BIGINT,
    banner_imageurl       VARCHAR(255),
    registration_deadline TIMESTAMP,
    status                VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',
    created_at            TIMESTAMP   DEFAULT NOW(),
    updated_at            TIMESTAMP   DEFAULT NOW()
);

-- ============================================================
-- 12. RACE HORSE
-- ============================================================
CREATE TABLE IF NOT EXISTS race_horse (
    id             BIGSERIAL PRIMARY KEY,
    race_id        BIGINT NOT NULL REFERENCES race(id),
    horse_id       BIGINT NOT NULL REFERENCES horse(horse_id),
    jockey_id      BIGINT REFERENCES jockey(id),
    lane_number    BIGINT,
    start_position BIGINT,
    odds           NUMERIC(10,2),
    register_at    TIMESTAMP   DEFAULT NOW(),
    status         VARCHAR(20) DEFAULT 'Pending'
);

-- ============================================================
-- 13. RACE RESULT
-- ============================================================
CREATE TABLE IF NOT EXISTS race_result (
    id             BIGSERIAL PRIMARY KEY,
    race_id        BIGINT NOT NULL REFERENCES race(id),
    race_horse_id  BIGINT NOT NULL REFERENCES race_horse(id),
    rank           BIGINT,
    completiontime TIMESTAMP,
    rewards        BIGINT DEFAULT 0
);

-- ============================================================
-- 14. PENALTY
-- ============================================================
CREATE TABLE IF NOT EXISTS penalty (
    penalty_id    BIGSERIAL PRIMARY KEY,
    race_horse_id BIGINT,
    reason        VARCHAR(255),
    penalty_type  VARCHAR(50),
    amount        BIGINT,
    CONSTRAINT fk_penalty_race_horse FOREIGN KEY (race_horse_id) REFERENCES race_horse(id)
);

-- ============================================================
-- 15. BET
-- ============================================================
CREATE TABLE IF NOT EXISTS bet (
    id           BIGSERIAL PRIMARY KEY,
    race_id      BIGINT       NOT NULL REFERENCES race(id),
    user_id      BIGINT       NOT NULL REFERENCES users(user_id),
    total_amount NUMERIC(12,2),
    status       VARCHAR(20)  DEFAULT 'PENDING',
    created_at   TIMESTAMP    DEFAULT NOW()
);

-- ============================================================
-- 16. BET ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS bet_items (
    id            BIGSERIAL PRIMARY KEY,
    bet_id        BIGINT       NOT NULL REFERENCES bet(id),
    race_horse_id BIGINT       NOT NULL REFERENCES race_horse(id),
    bet_amount    BIGINT       NOT NULL,
    odds          NUMERIC(10,2) NOT NULL DEFAULT 2.0,
    result_status VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    payout        NUMERIC(12,2) DEFAULT 0
);

-- ============================================================
-- 17. TRANSACTION REQUEST
-- ============================================================
CREATE TABLE IF NOT EXISTS transaction_request (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT      NOT NULL REFERENCES users(user_id),
    request_type   VARCHAR(20) NOT NULL,
    amount         BIGINT      NOT NULL,
    request_status VARCHAR(20) DEFAULT 'PENDING',
    payment_method VARCHAR(20),
    reference_code VARCHAR(50) UNIQUE,
    qr_url         TEXT,
    verify_note    VARCHAR(255),
    processedby    VARCHAR(50),
    created_at     TIMESTAMP   DEFAULT NOW(),
    processedat    TIMESTAMP
);

-- ============================================================
-- 18. PAYMENT TRANSACTION
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_transaction (
    id               BIGSERIAL PRIMARY KEY,
    request_id       BIGINT      NOT NULL REFERENCES transaction_request(id),
    transaction_type VARCHAR(20),
    status           VARCHAR(20) NOT NULL,
    completed_at     TIMESTAMP
);

-- ============================================================
-- 19. NOTIFICATION
-- ============================================================
CREATE TABLE IF NOT EXISTS notification (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES users(user_id),
    title        VARCHAR(150) NOT NULL,
    content      VARCHAR(255) NOT NULL,
    type         VARCHAR(50),
    reference_id BIGINT,
    is_read      BOOLEAN   DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 20. USER ROLES (junction table nếu dùng many-to-many)
-- ============================================================
-- Nếu project dùng bảng user_roles riêng, bỏ comment phần này:
-- CREATE TABLE IF NOT EXISTS user_roles (
--     user_id    BIGINT NOT NULL REFERENCES users(user_id),
--     role_id    BIGINT NOT NULL REFERENCES roles(id),
--     status     VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
--     created_at TIMESTAMP,
--     updated_at TIMESTAMP,
--     PRIMARY KEY (user_id, role_id)
-- );

-- ============================================================
-- SEED DATA
-- ============================================================

-- Seed 4 roles mặc định
INSERT INTO roles (RoleName, description) VALUES
    ('HORSE_OWNER', 'Horse Owner'),
    ('TRAINER',     'Horse Trainer'),
    ('REFEREE',     'Race Referee'),
    ('SPECTATOR',   'Spectator')
ON CONFLICT (RoleName) DO NOTHING;

-- Backfill wallet cho users chưa có (chạy sau khi đã có data)
INSERT INTO wallet (user_id, balance)
SELECT u.user_id, 0
FROM users u
LEFT JOIN wallet w ON w.user_id = u.user_id
WHERE w.user_id IS NULL;

COMMIT;
