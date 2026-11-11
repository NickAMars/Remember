import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCardReviews1731283200000 implements MigrationInterface {
  name = 'AddCardReviews1731283200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "card_reviews" (
        "id"               SERIAL        PRIMARY KEY,
        "uuid"             uuid          NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
        "ease_factor"      real          NOT NULL DEFAULT 2.5,
        "interval"         int           NOT NULL DEFAULT 0,
        "repetitions"      int           NOT NULL DEFAULT 0,
        "next_review_at"   timestamptz   NOT NULL DEFAULT now(),
        "last_reviewed_at" timestamptz   NOT NULL DEFAULT now(),
        "user_id"          int           NOT NULL,
        "sub_card_id"      int           NOT NULL,
        "created_at"       timestamptz   NOT NULL DEFAULT now(),
        "updated_at"       timestamptz   NOT NULL DEFAULT now(),
        CONSTRAINT "fk_card_reviews_user"
          FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_card_reviews_sub_card"
          FOREIGN KEY ("sub_card_id") REFERENCES "sub_cards" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_card_reviews_user_sub_card"
        ON "card_reviews" ("user_id", "sub_card_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_card_reviews_user_next_review"
        ON "card_reviews" ("user_id", "next_review_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_card_reviews_user_next_review"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_card_reviews_user_sub_card"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "card_reviews"`);
  }
}
