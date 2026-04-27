import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatMembersDeletedAtField1777037096311 implements MigrationInterface {
    name = 'AddChatMembersDeletedAtField1777037096311';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "chats_members" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "chats_members" DROP COLUMN "deleted_at"`
        );
    }
}
