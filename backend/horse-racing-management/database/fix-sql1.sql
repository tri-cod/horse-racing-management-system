-- Fix wallet (bỏ @MapsId)
ALTER TABLE wallet ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
ALTER TABLE wallet DROP CONSTRAINT IF EXISTS wallet_pkey;
ALTER TABLE wallet ADD COLUMN IF NOT EXISTS user_id BIGINT UNIQUE REFERENCES users(user_id);

-- Fix bet_items
ALTER TABLE bet_items ALTER COLUMN id SET DEFAULT nextval('bet_items_id_seq');
CREATE SEQUENCE IF NOT EXISTS bet_items_id_seq;
ALTER TABLE bet_items ALTER COLUMN id SET DEFAULT nextval('bet_items_id_seq');


DROP TABLE IF EXISTS bet_items CASCADE;
CREATE TABLE bet_items (
                           id            BIGSERIAL PRIMARY KEY,
                           bet_id        BIGINT NOT NULL REFERENCES bet(id),
                           race_horse_id BIGINT NOT NULL REFERENCES race_horse(id),
                           bet_amount    BIGINT NOT NULL,
                           odds          NUMERIC(10,2) NOT NULL DEFAULT 2.0,
                           result_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                           payout        NUMERIC(12,2) DEFAULT 0
);

DROP TABLE IF EXISTS wallet CASCADE;
CREATE TABLE wallet (
                        id      BIGSERIAL PRIMARY KEY,
                        user_id BIGINT NOT NULL UNIQUE REFERENCES users(user_id),
                        balance NUMERIC(19,2) DEFAULT 0
);


ALTER TABLE race_horse ADD COLUMN IF NOT EXISTS odds NUMERIC(10,2);

ALTER TABLE race_result ALTER COLUMN penalty_id DROP NOT NULL;

DROP TABLE IF EXISTS bank_account CASCADE;
CREATE TABLE bank_account (
                              bank_account_id BIGSERIAL PRIMARY KEY,
                              user_id         BIGINT NOT NULL REFERENCES users(user_id),
                              bank_name       VARCHAR(150) NOT NULL,
                              bank_user_name  VARCHAR(150) NOT NULL,
                              bank_number     VARCHAR(150) NOT NULL
);

DROP TABLE IF EXISTS race_result CASCADE;

CREATE TABLE race_result (
                             id             BIGSERIAL PRIMARY KEY,
                             race_id        BIGINT NOT NULL REFERENCES race(id),
                             race_horse_id  BIGINT NOT NULL REFERENCES race_horse(id),
                             rank           BIGINT,
                             completiontime TIMESTAMP,
                             rewards        BIGINT DEFAULT 0
);


ALTER TABLE horse
    ADD COLUMN description TEXT;

ALTER TABLE race_result ADD COLUMN completion_time_seconds DOUBLE PRECISION;


DROP TABLE IF EXISTS race_result CASCADE;

CREATE TABLE race_result (
                             id                      BIGSERIAL PRIMARY KEY,
                             race_horse_id           BIGINT NOT NULL REFERENCES race_horse(id),
                             race_id                 BIGINT NOT NULL REFERENCES race(id),
                             rank                    BIGINT,
                             completion_time_seconds DOUBLE PRECISION,
                             rewards                 BIGINT DEFAULT 0
);

ALTER TABLE jockey ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);

-- Jockey
ALTER TABLE jockey ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);
ALTER TABLE jockey ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(255);

-- Trainer
ALTER TABLE trainer ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(255);

ALTER TABLE race ADD COLUMN IF NOT EXISTS entry_fee BIGINT DEFAULT 0;


ALTER TABLE race_horse
    ADD COLUMN IF NOT EXISTS jockey_revenue_percent NUMERIC(5,2) DEFAULT 10.00,
    ADD COLUMN IF NOT EXISTS owner_revenue_percent  NUMERIC(5,2) DEFAULT 90.00;

ALTER TABLE race_horse ADD COLUMN IF NOT EXISTS withdraw_reason TEXT;
--==========================================================
-- HorseStatus: thêm RACING, FINISHED, sửa RETIRE → RETIRED
UPDATE horse SET status = 'ACTIVE' WHERE status = 'Active';
UPDATE horse SET status = 'INACTIVE' WHERE status = 'Inactive';
UPDATE horse SET status = 'RETIRED' WHERE status = 'RETIRE';
--==========================================================
-- HorseHorse status column đã dùng ENUM STRING nên tự động khi thêm vào Java enum
ALTER TABLE race_horse
    DROP CONSTRAINT IF EXISTS race_horse_status_check;
--==========================================================
-- Fix Penalty table
DROP TABLE IF EXISTS penalty CASCADE;
CREATE TABLE penalty (
                         penalty_id          BIGSERIAL PRIMARY KEY,
                         race_horse_id       BIGINT NOT NULL REFERENCES race_horse(id),
                         referee_id          BIGINT NOT NULL REFERENCES race_referee(id),
                         reason              VARCHAR(255),
                         penalty_type        VARCHAR(50),  -- FINE, DISQUALIFY, TIME_PENALTY, WARNING
                         amount              BIGINT,
                         time_penalty_seconds DOUBLE PRECISION,
                         is_disqualified     BOOLEAN DEFAULT FALSE,
                         created_at          TIMESTAMP DEFAULT NOW()
);

ALTER TABLE race_referee ALTER COLUMN experienceyears DROP NOT NULL;
ALTER TABLE race_referee ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE race_referee ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);
ALTER TABLE race_referee ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(255);

ALTER TABLE jockey
    DROP COLUMN IF EXISTS age;

ALTER TABLE jockey
    ADD COLUMN date_of_birth DATE;

ALTER TABLE trainer
    DROP COLUMN IF EXISTS age;

ALTER TABLE trainer
    ADD COLUMN date_of_birth DATE;

ALTER TABLE penalty DROP CONSTRAINT IF EXISTS penalty_race_horse_id_fkey;
ALTER TABLE penalty ADD CONSTRAINT penalty_race_horse_id_fkey
    FOREIGN KEY (race_horse_id) REFERENCES race_horse(id) ON DELETE CASCADE;