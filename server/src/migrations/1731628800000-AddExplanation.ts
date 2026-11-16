import { MigrationInterface, QueryRunner } from 'typeorm';

/** Each card can store an optional explanation shown after the quiz or on the card back. */
export class AddExplanation1731628800000 implements MigrationInterface {
  name = 'AddExplanation1731628800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sub_cards" ADD COLUMN IF NOT EXISTS "explanation" text NOT NULL DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "pool_sub_cards" ADD COLUMN IF NOT EXISTS "explanation" text NOT NULL DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pool_sub_cards" DROP COLUMN IF EXISTS "explanation"`);
    await queryRunner.query(`ALTER TABLE "sub_cards" DROP COLUMN IF EXISTS "explanation"`);
  }
}
