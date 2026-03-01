import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAlbumsTable1772299723782 implements MigrationInterface {
    name = 'AddAlbumsTable1772299723782';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "albums" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying, "image" character varying NOT NULL, "is_published" boolean NOT NULL DEFAULT false, "user_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_838ebae24d2e12082670ffc95d7" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "albums" ADD CONSTRAINT "FK_2c6a2dfb05cb87cc38e2a8b9dc1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "albums" DROP CONSTRAINT "FK_2c6a2dfb05cb87cc38e2a8b9dc1"`
        );
        await queryRunner.query(`DROP TABLE "albums"`);
    }
}
