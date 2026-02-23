import { MigrationInterface, QueryRunner } from 'typeorm';

export class RmUserPhoneField1771671763883 implements MigrationInterface {
    name = 'RmUserPhoneField1771671763883';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" ADD "phone" character varying`
        );
    }
}
