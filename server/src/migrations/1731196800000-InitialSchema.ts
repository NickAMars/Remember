import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1731196800000 implements MigrationInterface {
  name = 'InitialSchema1731196800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid-ossp extension for uuid_generate_v4()
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ── users ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"            SERIAL        PRIMARY KEY,
        "uuid"          uuid          NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
        "oauth_code"    varchar(255),
        "name"          varchar(255)  NOT NULL UNIQUE,
        "password_hash" varchar(255),
        "auth_type"     varchar(20)   NOT NULL DEFAULT 'local',
        "created_at"    timestamptz   NOT NULL DEFAULT now(),
        "updated_at"    timestamptz   NOT NULL DEFAULT now()
      )
    `);

    // ── master_cards ───────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "master_cards" (
        "id"          SERIAL         PRIMARY KEY,
        "uuid"        uuid           NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
        "title"       varchar(255)   NOT NULL,
        "url"         varchar(1000)  NOT NULL DEFAULT '',
        "timespent"   int            NOT NULL DEFAULT 0,
        "views"       int            NOT NULL DEFAULT 0,
        "is_default"  boolean        NOT NULL DEFAULT false,
        "is_copied"   boolean        NOT NULL DEFAULT false,
        "user_id"     int            NOT NULL,
        "created_at"  timestamptz    NOT NULL DEFAULT now(),
        "updated_at"  timestamptz    NOT NULL DEFAULT now(),
        CONSTRAINT "fk_master_cards_user"
          FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    // ── sub_cards ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "sub_cards" (
        "id"              SERIAL          PRIMARY KEY,
        "uuid"            uuid            NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
        "title"           varchar(1000)   NOT NULL,
        "descriptions"    text            NOT NULL DEFAULT '',
        "link"            varchar(2000)   NOT NULL DEFAULT '',
        "views"           int             NOT NULL DEFAULT 0,
        "master_card_id"  int             NOT NULL,
        "created_at"      timestamptz     NOT NULL DEFAULT now(),
        CONSTRAINT "fk_sub_cards_master_card"
          FOREIGN KEY ("master_card_id") REFERENCES "master_cards" ("id") ON DELETE CASCADE
      )
    `);

    // ── progress ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "progress" (
        "id"              SERIAL      PRIMARY KEY,
        "time"            int         NOT NULL DEFAULT 0,
        "day_created"     timestamptz NOT NULL,
        "master_card_id"  int         NOT NULL,
        CONSTRAINT "fk_progress_master_card"
          FOREIGN KEY ("master_card_id") REFERENCES "master_cards" ("id") ON DELETE CASCADE
      )
    `);

    // ── pool_cards ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "pool_cards" (
        "id"          SERIAL        PRIMARY KEY,
        "uuid"        uuid          NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
        "author"      varchar(255)  NOT NULL,
        "title"       varchar(255)  NOT NULL,
        "created_at"  timestamptz   NOT NULL DEFAULT now()
      )
    `);

    // ── pool_sub_cards ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "pool_sub_cards" (
        "id"            SERIAL          PRIMARY KEY,
        "uuid"          uuid            NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
        "title"         varchar(1000)   NOT NULL,
        "descriptions"  text            NOT NULL DEFAULT '',
        "link"          varchar(2000)   NOT NULL DEFAULT '',
        "pool_card_id"  int             NOT NULL,
        CONSTRAINT "fk_pool_sub_cards_pool_card"
          FOREIGN KEY ("pool_card_id") REFERENCES "pool_cards" ("id") ON DELETE CASCADE
      )
    `);

    // ── folders ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "folders" (
        "id"          SERIAL        PRIMARY KEY,
        "uuid"        uuid          NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
        "name"        varchar(255)  NOT NULL,
        "user_id"     int           NOT NULL,
        "created_at"  timestamptz   NOT NULL DEFAULT now(),
        "updated_at"  timestamptz   NOT NULL DEFAULT now(),
        CONSTRAINT "fk_folders_user"
          FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    // ── folder_master_cards (many-to-many join table) ──────────────────
    await queryRunner.query(`
      CREATE TABLE "folder_master_cards" (
        "folder_id"       int NOT NULL,
        "master_card_id"  int NOT NULL,
        PRIMARY KEY ("folder_id", "master_card_id"),
        CONSTRAINT "fk_folder_master_cards_folder"
          FOREIGN KEY ("folder_id") REFERENCES "folders" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_folder_master_cards_master_card"
          FOREIGN KEY ("master_card_id") REFERENCES "master_cards" ("id") ON DELETE CASCADE
      )
    `);

    // Index on the inverse side for efficient lookups by master_card_id
    await queryRunner.query(`
      CREATE INDEX "idx_folder_master_cards_master_card_id"
        ON "folder_master_cards" ("master_card_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_folder_master_cards_master_card_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "folder_master_cards"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "folders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pool_sub_cards"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pool_cards"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "progress"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sub_cards"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "master_cards"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
