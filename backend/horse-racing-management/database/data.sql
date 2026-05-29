



--drop database horse_racing_management_system


-----------------------------USERS / ROLES---------------------------

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



CREATE TABLE IF NOT EXISTS horse_owner(
    id bigint primary key,
    name varchar(150) not null ,
    description text,
    status varchar(20),
    constraint fk_horseOwner_horse_id foreign key (id) references horse(horse_id)
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










