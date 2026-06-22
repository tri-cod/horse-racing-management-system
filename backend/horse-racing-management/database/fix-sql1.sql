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

ALTER TABLE race_result ADD COLUMN completion_time_seconds DOUBLE PRECISION;
