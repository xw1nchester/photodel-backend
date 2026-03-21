import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFilesTable1774095336649 implements MigrationInterface {
    name = 'AddFilesTable1774095336649';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "files" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "original_name" character varying NOT NULL, "mime_type" character varying NOT NULL, "size" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "files" ADD CONSTRAINT "FK_a7435dbb7583938d5e7d1376041" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "files" DROP CONSTRAINT "FK_a7435dbb7583938d5e7d1376041"`
        );
        await queryRunner.query(`DROP TABLE "files"`);
    }
}
