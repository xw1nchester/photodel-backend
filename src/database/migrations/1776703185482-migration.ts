import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastReadMessageField1776703185482 implements MigrationInterface {
    name = 'AddLastReadMessageField1776703185482';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "chats_members" ADD "last_read_message_id" integer`
        );
        await queryRunner.query(
            `ALTER TABLE "chats_members" ADD CONSTRAINT "FK_66ea89a4a90e00727691f9d2480" FOREIGN KEY ("last_read_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
        await queryRunner.query(`DROP TABLE IF EXISTS messages_reads`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "chats_members" DROP CONSTRAINT "FK_66ea89a4a90e00727691f9d2480"`
        );
        await queryRunner.query(
            `ALTER TABLE "chats_members" DROP COLUMN "last_read_message_id"`
        );
    }
}
