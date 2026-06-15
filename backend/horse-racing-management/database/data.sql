


DROP TABLE IF EXISTS notification CASCADE;

CREATE TABLE notification (
                              id           BIGSERIAL PRIMARY KEY,
                              user_id      BIGINT NOT NULL REFERENCES users(user_id),
                              title        VARCHAR(150) NOT NULL,
                              content      VARCHAR(255) NOT NULL,
                              type         VARCHAR(50),
                              reference_id BIGINT,
                              is_read      BOOLEAN DEFAULT FALSE,
                              created_at   TIMESTAMP DEFAULT NOW()
);


--drop database horse_racing_management_system

ALTER TABLE horse
    ADD COLUMN gender VARCHAR(10) NOT NULL DEFAULT 'MALE',
    ADD COLUMN weight DECIMAL(5,2);

-- Thêm user_id vào trainer
ALTER TABLE trainer ADD COLUMN user_id BIGINT UNIQUE REFERENCES users(user_id);

-- Thêm user_id vào jockey
ALTER TABLE jockey ADD COLUMN user_id BIGINT UNIQUE REFERENCES users(user_id);
-----------------------------USERS / ROLES---------------------------
ALTER TABLE horse ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE horse ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

ALTER TABLE trainer DROP COLUMN name;

DROP TABLE IF EXISTS horse_owner CASCADE;



-- Drop và tạo lại race
DROP TABLE IF EXISTS race CASCADE;

CREATE TABLE race (
                      id              BIGSERIAL PRIMARY KEY,
                      referee_id      BIGINT REFERENCES race_referee(id),  -- nullable
                      race_name       VARCHAR(150) NOT NULL,
                      race_date       TIMESTAMP,
                      start_time      TIMESTAMP,
                      end_time        TIMESTAMP,
                      track_name      VARCHAR(150),
                      track_condition VARCHAR(50),
                      surface_type    VARCHAR(50),
                      totalprizepool  BIGINT,
                      distance        TEXT,
                      location        VARCHAR(150),
                      capacity        BIGINT,
                      banner_imageurl VARCHAR(255),
                      status          VARCHAR(20) DEFAULT 'Upcoming',
                      created_at      TIMESTAMP DEFAULT NOW(),
                      updated_at      TIMESTAMP DEFAULT NOW()
);

-- Fix race_referee
DROP TABLE IF EXISTS race_referee CASCADE;

CREATE TABLE race_referee (
                              id               BIGSERIAL PRIMARY KEY,
                              user_id          BIGINT UNIQUE REFERENCES users(user_id),
                              experienceyears  BIGINT,
                              status           VARCHAR(20) DEFAULT 'Active'
);

DROP TABLE IF EXISTS race_horse CASCADE;

CREATE TABLE race_horse (
                            id             BIGSERIAL PRIMARY KEY,
                            race_id        BIGINT NOT NULL REFERENCES race(id),
                            horse_id       BIGINT NOT NULL REFERENCES horse(horse_id),
                            jockey_id      BIGINT REFERENCES jockey(id),
                            lane_number    BIGINT,
                            start_position BIGINT,
                            register_at    TIMESTAMP DEFAULT NOW(),
                            status         VARCHAR(20) DEFAULT 'Pending'
);


-- Fix jockey table
DROP TABLE IF EXISTS jockey CASCADE;

CREATE TABLE jockey (
                        id              BIGSERIAL PRIMARY KEY,
                        user_id         BIGINT UNIQUE REFERENCES users(user_id),
                        age             BIGINT,
                        description     TEXT,
                        experience_year BIGINT,
                        status          VARCHAR(20) DEFAULT 'Active'
);

ALTER TABLE trainer ADD COLUMN IF NOT EXISTS user_id BIGINT UNIQUE REFERENCES users(user_id);
ALTER TABLE trainer ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE trainer ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);
ALTER TABLE trainer ALTER COLUMN age DROP NOT NULL;
ALTER TABLE trainer ALTER COLUMN experience_years DROP NOT NULL;

DROP TABLE IF EXISTS trainer CASCADE;

ALTER TABLE race ADD COLUMN registration_deadline TIMESTAMP;

ALTER TABLE notification DROP COLUMN type;
ALTER TABLE notification ADD COLUMN type VARCHAR(50);

ALTER TABLE bet
    ADD COLUMN user_id BIGINT NOT NULL;

ALTER TABLE bet
    ADD CONSTRAINT fk_bet_user
        FOREIGN KEY (user_id)
            REFERENCES users(user_id);

-- Bet
DROP TABLE IF EXISTS bet CASCADE;
CREATE TABLE bet (
                     id           BIGSERIAL PRIMARY KEY,
                     race_id      BIGINT NOT NULL REFERENCES race(id),
                     user_id      BIGINT NOT NULL REFERENCES users(user_id),
                     total_amount NUMERIC(12,2),
                     status       VARCHAR(20) DEFAULT 'PENDING',
                     created_at   TIMESTAMP DEFAULT NOW()
);

-- BetItem
DROP TABLE IF EXISTS bet_items CASCADE;
CREATE TABLE bet_items (
                           id             BIGSERIAL PRIMARY KEY,
                           bet_id         BIGINT NOT NULL REFERENCES bet(id),
                           race_horse_id  BIGINT NOT NULL REFERENCES race_horse(id),
                           bet_amount     BIGINT NOT NULL,
                           odds           NUMERIC(10,2) DEFAULT 2.0,
                           result_status  VARCHAR(20) DEFAULT 'PENDING',
                           payout         NUMERIC(12,2) DEFAULT 0
);

-- TransactionRequest
DROP TABLE IF EXISTS transaction_request CASCADE;
CREATE TABLE transaction_request (
                                     id               BIGSERIAL PRIMARY KEY,
                                     user_id          BIGINT NOT NULL REFERENCES users(user_id),
                                     request_type     VARCHAR(20) NOT NULL,
                                     amount           BIGINT NOT NULL,
                                     request_status   VARCHAR(20) DEFAULT 'PENDING',
                                     payment_method   VARCHAR(20),
                                     reference_code   VARCHAR(50) UNIQUE,
                                     qr_url           TEXT,
                                     verify_note      VARCHAR(255),
                                     processedby      VARCHAR(50),
                                     created_at       TIMESTAMP DEFAULT NOW(),
                                     processedat      TIMESTAMP
);

-- RaceResult
DROP TABLE IF EXISTS race_result CASCADE;
CREATE TABLE race_result (
                             id              BIGSERIAL PRIMARY KEY,
                             race_id         BIGINT NOT NULL REFERENCES race(id),
                             race_horse_id   BIGINT NOT NULL REFERENCES race_horse(id),
                             rank            BIGINT,
                             completiontime  TIMESTAMP,
                             rewards         BIGINT DEFAULT 0
);

-- Wallet fix (thêm DEFAULT 0)
ALTER TABLE wallet ALTER COLUMN balance SET DEFAULT 0;

CREATE TABLE trainer (
                         id BIGSERIAL PRIMARY KEY,
                         user_id BIGINT UNIQUE REFERENCES users(user_id),

                         name VARCHAR(150) NOT NULL,
                         age INTEGER,
                         experience_years INTEGER,

                         description TEXT,
                         avatar_url VARCHAR(255),

                         status VARCHAR(20) DEFAULT 'Active'
);

ALTER TABLE horse
    ADD CONSTRAINT fk_horse_trainer
        FOREIGN KEY (trainer_id)
            REFERENCES trainer(id);

CREATE TABLE IF NOT EXISTS trainer(
                                      id bigint primary key ,
                                      name varchar(150) not null ,
                                      age bigserial not null ,
                                      experience_years bigserial,
                                      status varchar(20) default ('Active')
);

CREATE TABLE IF NOT EXISTS forgot_password(
            id BIGSERIAL PRIMARY KEY,
    otp int not null ,
        expiration_time TIMESTAMP,
            user_id BIGINT NOT NULL UNIQUE,
            CONSTRAINT fk_verification_user
                FOREIGN KEY (user_id)
                    REFERENCES users(user_id)
                    ON DELETE CASCADE
);


CREATE TABLE horse_owner (
                             id          BIGSERIAL PRIMARY KEY,  -- ← BIGSERIAL tự tăng
                             user_id     BIGINT NOT NULL UNIQUE REFERENCES users(user_id),
                             name        VARCHAR(150) NOT NULL,
                             description TEXT,
                             status      VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
    );

CREATE TABLE IF NOT EXISTS users (
    role_id bigint NOT NULL,
    user_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    userName VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    phoneNumber VARCHAR(20),
    avatar_url VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id)
    );

CREATE TABLE IF NOT EXISTS bank_account(
    bank_account_id BIGINT PRIMARY KEY,
    user_id BIGSERIAL,
    bank_name varchar(150) not null ,
    bank_user_name varchar(150) not null ,
    bank_number varchar(150) not null,
    constraint fk_bank_user_user foreign key (user_id) references users(user_id)
);

DROP TABLE IF EXISTS horse CASCADE;

CREATE TABLE horse (
                       horse_id     BIGSERIAL PRIMARY KEY,  -- ← BIGSERIAL
                       trainer_id   BIGINT REFERENCES trainer(id),
                       owner_id     BIGINT REFERENCES horse_owner(id),
                       horse_name   VARCHAR(150) NOT NULL,
                       breed        VARCHAR(50) NOT NULL,
                       age          INT NOT NULL,
                       speed_rating INT,
                       history_rank VARCHAR(50),
                       avatar_url   VARCHAR(255),
                       gender       VARCHAR(20),
                       weight       BIGINT,
                       status       VARCHAR(20) NOT NULL DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS horse(
    horse_id bigint primary key ,
    trainer_id bigint not null,
    owner_id bigint,
    horse_name varchar(150) not null ,
    breed varchar(50) not null,
    age integer  not null ,
    speed_rating integer,
    history_rank varchar(50),
    avatar_url VARCHAR(255),
    status varchar(20) not null default ('Active')
);

CREATE TABLE IF NOT EXISTS race_referee(
    id bigserial primary key ,
    full_name varchar(50),
    experienceYears bigserial,
    status varchar(20)
);

CREATE TABLE IF NOT EXISTS penalty(
    penalty_id bigint primary key ,
    race_horse_id bigserial,
    reason varchar(255),
    penalty_type varchar(50),
    Amount bigserial,
    constraint fk_pen_raceHorse_id foreign key (race_horse_id) references race_horse(id)
);



CREATE TABLE horse_owner (
                             id          BIGSERIAL PRIMARY KEY,  -- ← BIGSERIAL tự tăng
                             user_id     BIGINT NOT NULL UNIQUE REFERENCES users(user_id),
                             name        VARCHAR(150) NOT NULL,
                             description TEXT,
                             status      VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS trainer(
    id bigint primary key ,
    name varchar(150) not null ,
    age bigserial not null ,
    experience_years bigserial,
    status varchar(20) default ('Active')
);

CREATE TABLE IF NOT EXISTS jockey(
    id bigint primary key ,
    name varchar(150),
    age bigserial not null ,
    description text,
    experience_year bigserial ,
    status varchar(20) default ('Active')
);
---------------------------RACE---------------------------

CREATE TABLE IF NOT EXISTS race(
    id bigint primary key ,
    referee_id bigserial not null ,
    race_name varchar(150) not null,
    race_date timestamp,
    start_time timestamp,
    end_time timestamp,
    track_name varchar(150) not null,
    track_condition varchar(50) not null,
    surface_type varchar(50),
    totalPrizePool bigserial not null ,
    distance varchar not null ,
    location varchar(150),
    capacity bigint,
    banner_imageUrl varchar(255),
    status varchar(20),

    constraint fk_race_referee_refereeId foreign key (referee_id) references race_referee(id)

);

CREATE TABLE IF NOT EXISTS race_horse(
    id bigint primary key ,
    race_id bigserial ,
    horse_id bigserial ,
    jockey_id bigserial,
    lane_Number bigserial,
    start_position bigserial,
    register_at timestamp,
    status varchar(20) default ('Actice'),
    constraint fk_raceHorse_race_id foreign key (race_id) references race(id),
    constraint  fk_raceHorse_horse_id foreign key (horse_id) references horse(horse_id),
    constraint fk_raceHorse_Jokcey_id foreign key (jockey_id) references  jockey(id)
  );

CREATE TABLE IF NOT EXISTS race_result(
    id bigint primary key ,
    race_horse_id bigserial not null,
    rank bigint,
    completionTime timestamp,
    rewards bigserial ,
    penalty_id bigserial,
    constraint fk_raceResult_raceHorse foreign key (id) references race_horse(id)
);



---------------------------BET---------------------------
CREATE TABLE IF NOT EXISTS bet(
    id bigint primary key ,
    race_id bigserial not null ,
    total_amount NUMERIC(12,2),
    status varchar(20),
    created_at timestamp,
    constraint fk_bet_race_id foreign key (race_id) references race(id)

);
CREATE TABLE IF NOT EXISTS bet_items(
    id bigint primary key ,
    bet_id bigserial not null ,
    race_horse_id bigserial not null ,
    bet_amount bigserial not null,
    odds decimal(10,2) not null,
    result_status varchar(20) not null default ('Pending'),
    constraint fk_betItems_bet_id foreign key (bet_id) references bet(id),
    constraint fk_betItems_raceHorse_id foreign key (race_horse_id) references race_horse(id)

);

CREATE TABLE IF NOT EXISTS notification(
    id bigint primary key ,
    user_id bigserial not null ,
    title varchar(150) not null ,
    content varchar(255) not null ,
    created_at timestamp,
    constraint fk_notification_user_id foreign key (user_id) references users(user_id)
);

---------------------------WALLET---------------------------

CREATE TABLE IF NOT EXISTS wallet(
    id bigint primary key ,
    user_id bigserial not null ,
    Balance decimal(10,2),
    constraint fk_wallet_user_id foreign key (id) references users(user_id)
);

DROP TABLE IF EXISTS wallet;

CREATE TABLE IF NOT EXISTS wallet (
                                      wallet_id BIGSERIAL PRIMARY KEY,
                                      user_id BIGINT NOT NULL UNIQUE,
                                      balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,

                                      CONSTRAINT fk_wallet_user
                                          FOREIGN KEY (user_id)
                                              REFERENCES users(user_id)
                                              ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS transaction_request(
    id bigint primary key ,
    request_type varchar(20) not null default ('Pending'),
    amount bigserial not null ,
    request_status varchar(20) default ('Pending'),
    payment_method varchar(20) not null ,
    verify_note varchar(20),
    created_at timestamp,
    processedBy varchar(50),
    processedAt timestamp
);

CREATE TABLE IF NOT EXISTS payment_transaction(
    id bigint primary key ,
    request_id  bigserial not null ,
    transaction_type varchar(20),
    status varchar(20)not null ,
    completed_at timestamp,
    foreign key (request_id) references transaction_request(id)
)








