import { MigrationInterface, QueryRunner } from 'typeorm';

/** Each card can store similar but incorrect answers, shown as wrong choices in Quiz mode. */
export class AddWrongAnswers1731456000000 implements MigrationInterface {
  name = 'AddWrongAnswers1731456000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sub_cards" ADD COLUMN IF NOT EXISTS "wrong_answers" text[] NOT NULL DEFAULT '{}'`);
    await queryRunner.query(`ALTER TABLE "pool_sub_cards" ADD COLUMN IF NOT EXISTS "wrong_answers" text[] NOT NULL DEFAULT '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pool_sub_cards" DROP COLUMN IF EXISTS "wrong_answers"`);
    await queryRunner.query(`ALTER TABLE "sub_cards" DROP COLUMN IF EXISTS "wrong_answers"`);
  }
}
