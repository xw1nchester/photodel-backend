import { MigrationInterface, QueryRunner } from "typeorm";

export class MessageDeletedAtField1776958757189 implements MigrationInterface {
    name = 'MessageDeletedAtField1776958757189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "deleted_at"`);
    }

}
