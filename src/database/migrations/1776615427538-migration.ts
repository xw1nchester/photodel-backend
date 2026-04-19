import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetChatLatestMessageNullable1776615427538 implements MigrationInterface {
    name = 'SetChatLatestMessageNullable1776615427538';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "chats" DROP CONSTRAINT "FK_418587fbcdd2a37760111896a00"`
        );
        await queryRunner.query(
            `ALTER TABLE "chats" ALTER COLUMN "latest_message_id" DROP NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "chats" ADD CONSTRAINT "FK_418587fbcdd2a37760111896a00" FOREIGN KEY ("latest_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "chats" DROP CONSTRAINT "FK_418587fbcdd2a37760111896a00"`
        );
        await queryRunner.query(
            `ALTER TABLE "chats" ALTER COLUMN "latest_message_id" SET NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "chats" ADD CONSTRAINT "FK_418587fbcdd2a37760111896a00" FOREIGN KEY ("latest_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
    }
}
