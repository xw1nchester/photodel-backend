import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSocialIconAndFixTempLocationsFK1772204248379 implements MigrationInterface {
    name = 'AddSocialIconAndFixTempLocationsFK1772204248379';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "socials" ADD "icon" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" DROP CONSTRAINT "FK_55a90d74c5caefb731e144a4bfd"`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" ALTER COLUMN "profile_id" SET NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" ADD CONSTRAINT "FK_55a90d74c5caefb731e144a4bfd" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" DROP CONSTRAINT "FK_55a90d74c5caefb731e144a4bfd"`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" ALTER COLUMN "profile_id" DROP NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" ADD CONSTRAINT "FK_55a90d74c5caefb731e144a4bfd" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(`ALTER TABLE "socials" DROP COLUMN "icon"`);
    }
}
