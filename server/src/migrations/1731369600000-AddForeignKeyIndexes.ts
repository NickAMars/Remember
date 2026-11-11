import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * perf Increase: Postgres does not index foreign key columns on its own.
 * Without these, loading a deck's cards, a user's decks or a folder list scans
 * the whole table, and deleting a deck scans every child table.
 */
export class AddForeignKeyIndexes1731369600000 implements MigrationInterface {
  name = 'AddForeignKeyIndexes1731369600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_master_cards_user_id" ON "master_cards" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_sub_cards_master_card_id_created_at" ON "sub_cards" ("master_card_id", "created_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_progress_master_card_id" ON "progress" ("master_card_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_pool_cards_author" ON "pool_cards" ("author")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_pool_sub_cards_pool_card_id" ON "pool_sub_cards" ("pool_card_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_folders_user_id" ON "folders" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_card_reviews_sub_card_id" ON "card_reviews" ("sub_card_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_card_reviews_sub_card_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_folders_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_pool_sub_cards_pool_card_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_pool_cards_author"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_progress_master_card_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_sub_cards_master_card_id_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_master_cards_user_id"`);
  }
}
