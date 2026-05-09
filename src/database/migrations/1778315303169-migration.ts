import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSiteSocialsTable1778315303169 implements MigrationInterface {
    name = 'AddSiteSocialsTable1778315303169'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "site_socials" ("social_id" integer NOT NULL, "label" character varying NOT NULL, "url" character varying NULL, CONSTRAINT "PK_918afe4681d89c6b2c79d78c51e" PRIMARY KEY ("social_id"))`);
        await queryRunner.query(`ALTER TABLE "site_socials" ADD CONSTRAINT "FK_918afe4681d89c6b2c79d78c51e" FOREIGN KEY ("social_id") REFERENCES "socials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site_socials" DROP CONSTRAINT "FK_918afe4681d89c6b2c79d78c51e"`);
        await queryRunner.query(`DROP TABLE "site_socials"`);
    }

}
