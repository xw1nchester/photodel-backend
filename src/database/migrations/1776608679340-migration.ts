import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessengerInitialTables1776608679340 implements MigrationInterface {
    name = 'AddMessengerInitialTables1776608679340';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_places_coordinates"`);
        await queryRunner.query(
            `CREATE TABLE "chats_members" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "chat_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1f640acc4cdebdbf0111d7d10a0" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "chats" ("id" SERIAL NOT NULL, "latest_message_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0117647b3c4a4e5ff198aeb6206" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "messages" ("id" SERIAL NOT NULL, "content" character varying NOT NULL, "sender_id" integer NOT NULL, "chat_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "messages_reads" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "message_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0b00d757daedc2ab3ecc882f2d7" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "chats_members" ADD CONSTRAINT "FK_a559d9e93ebf980eb0c5918376b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "chats_members" ADD CONSTRAINT "FK_21fef34e61373ccc7b7bcd2528d" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "chats" ADD CONSTRAINT "FK_418587fbcdd2a37760111896a00" FOREIGN KEY ("latest_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "messages" ADD CONSTRAINT "FK_22133395bd13b970ccd0c34ab22" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "messages" ADD CONSTRAINT "FK_7540635fef1922f0b156b9ef74f" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "messages_reads" ADD CONSTRAINT "FK_3502cfc7d81eb8d83c15f6f9e98" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "messages_reads" ADD CONSTRAINT "FK_4f46485a3300ee532324f394e7b" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "messages_reads" DROP CONSTRAINT "FK_4f46485a3300ee532324f394e7b"`
        );
        await queryRunner.query(
            `ALTER TABLE "messages_reads" DROP CONSTRAINT "FK_3502cfc7d81eb8d83c15f6f9e98"`
        );
        await queryRunner.query(
            `ALTER TABLE "messages" DROP CONSTRAINT "FK_7540635fef1922f0b156b9ef74f"`
        );
        await queryRunner.query(
            `ALTER TABLE "messages" DROP CONSTRAINT "FK_22133395bd13b970ccd0c34ab22"`
        );
        await queryRunner.query(
            `ALTER TABLE "chats" DROP CONSTRAINT "FK_418587fbcdd2a37760111896a00"`
        );
        await queryRunner.query(
            `ALTER TABLE "chats_members" DROP CONSTRAINT "FK_21fef34e61373ccc7b7bcd2528d"`
        );
        await queryRunner.query(
            `ALTER TABLE "chats_members" DROP CONSTRAINT "FK_a559d9e93ebf980eb0c5918376b"`
        );
        await queryRunner.query(`DROP TABLE "messages_reads"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "chats"`);
        await queryRunner.query(`DROP TABLE "chats_members"`);
        await queryRunner.query(
            `CREATE INDEX "idx_places_coordinates" ON "places" USING GiST ("coordinates") `
        );
    }
}
