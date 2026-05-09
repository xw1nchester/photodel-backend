import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1778322536665 implements MigrationInterface {
    name = 'Migration1778322536665'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "socials" DROP COLUMN "icon"`);
        await queryRunner.query(`ALTER TABLE "socials" ADD "profile_icon" character varying`);
        await queryRunner.query(`ALTER TABLE "socials" ADD "site_icon" character varying`);
        await queryRunner.query(`ALTER TABLE "site_socials" ALTER COLUMN "url" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site_socials" ALTER COLUMN "url" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "socials" DROP COLUMN "site_icon"`);
        await queryRunner.query(`ALTER TABLE "socials" DROP COLUMN "profile_icon"`);
        await queryRunner.query(`ALTER TABLE "socials" ADD "icon" character varying`);
    }

}
