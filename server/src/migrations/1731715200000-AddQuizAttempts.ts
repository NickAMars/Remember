import { MigrationInterface, QueryRunner } from 'typeorm';

/** Store completed quiz attempts for the history view. */
export class AddQuizAttempts1731715200000 implements MigrationInterface {
  name = 'AddQuizAttempts1731715200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "quiz_attempts" (
        "id" SERIAL PRIMARY KEY,
        "uuid" uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
        "user_id" int NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "folder_id" int NOT NULL REFERENCES "folders"("id") ON DELETE CASCADE,
        "folder_name" varchar(255) NOT NULL DEFAULT '',
        "mode" varchar(10) NOT NULL,
        "total_questions" int NOT NULL,
        "correct_answers" int NOT NULL,
        "duration_seconds" int NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_quiz_attempts_user_folder" ON "quiz_attempts" ("user_id", "folder_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "quiz_attempts"`);
  }
}
