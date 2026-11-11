import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMarkedForReview1731542400000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE sub_cards ADD COLUMN marked_for_review boolean NOT NULL DEFAULT false`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE sub_cards DROP COLUMN marked_for_review`);
  }
}
