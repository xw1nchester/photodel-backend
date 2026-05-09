import { MigrationInterface, QueryRunner } from "typeorm";

export class IsBlockedUserField1778305924988 implements MigrationInterface {
    name = 'IsBlockedUserField1778305924988'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "is_blocked" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_blocked"`);
    }

}
