import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIsProField1772217875508 implements MigrationInterface {
    name = 'AddUserIsProField1772217875508';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" ADD "is_pro" boolean NOT NULL DEFAULT false`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_pro"`);
    }
}
