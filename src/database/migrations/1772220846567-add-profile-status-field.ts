import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileStatusField1772220846567 implements MigrationInterface {
    name = 'AddProfileStatusField1772220846567';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "profiles" ADD "status" character varying`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "status"`);
    }
}
