import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhotoSessionsTable1775290443239 implements MigrationInterface {
    name = 'AddPhotoSessionsTable1775290443239';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "photo_sessions" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "start_date" date NOT NULL, "end_date" date NOT NULL, "type" character varying NOT NULL, "is_published" boolean NOT NULL DEFAULT false, "user_id" integer NOT NULL, "preview_file_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "location_id" integer, CONSTRAINT "PK_f19a6be0f5b2b7700942bed0d68" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "photo_session_files" ("photo_session_id" integer NOT NULL, "file_id" integer NOT NULL, CONSTRAINT "PK_6e133eb7d6b47636d10b1c48f94" PRIMARY KEY ("photo_session_id", "file_id"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_54add29297a137aa0de67e8d1b" ON "photo_session_files" ("photo_session_id") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_713d6bf63e7a909508c5830341" ON "photo_session_files" ("file_id") `
        );
        await queryRunner.query(
            `CREATE TABLE "photo_session_team" ("photo_session_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_e6b8ac16848300c0e959f0d03ce" PRIMARY KEY ("photo_session_id", "user_id"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_caf5869411476482388e53692b" ON "photo_session_team" ("photo_session_id") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_fbeb8742f6a20d7f38cad48058" ON "photo_session_team" ("user_id") `
        );
        await queryRunner.query(
            `ALTER TYPE "public"."reviews_entity_type_enum" RENAME TO "reviews_entity_type_enum_old"`
        );
        await queryRunner.query(
            `CREATE TYPE "public"."reviews_entity_type_enum" AS ENUM('user', 'photo', 'place', 'photo_session')`
        );
        await queryRunner.query(
            `ALTER TABLE "reviews" ALTER COLUMN "entity_type" TYPE "public"."reviews_entity_type_enum" USING "entity_type"::"text"::"public"."reviews_entity_type_enum"`
        );
        await queryRunner.query(
            `DROP TYPE "public"."reviews_entity_type_enum_old"`
        );
        await queryRunner.query(
            `ALTER TABLE "likes" DROP CONSTRAINT "likes_unique"`
        );
        await queryRunner.query(
            `ALTER TYPE "public"."likes_entity_type_enum" RENAME TO "likes_entity_type_enum_old"`
        );
        await queryRunner.query(
            `CREATE TYPE "public"."likes_entity_type_enum" AS ENUM('user', 'photo', 'place', 'photo_session')`
        );
        await queryRunner.query(
            `ALTER TABLE "likes" ALTER COLUMN "entity_type" TYPE "public"."likes_entity_type_enum" USING "entity_type"::"text"::"public"."likes_entity_type_enum"`
        );
        await queryRunner.query(
            `DROP TYPE "public"."likes_entity_type_enum_old"`
        );
        await queryRunner.query(
            `ALTER TABLE "favorites" DROP CONSTRAINT "favorites_unique"`
        );
        await queryRunner.query(
            `ALTER TYPE "public"."favorites_entity_type_enum" RENAME TO "favorites_entity_type_enum_old"`
        );
        await queryRunner.query(
            `CREATE TYPE "public"."favorites_entity_type_enum" AS ENUM('user', 'photo', 'place', 'photo_session')`
        );
        await queryRunner.query(
            `ALTER TABLE "favorites" ALTER COLUMN "entity_type" TYPE "public"."favorites_entity_type_enum" USING "entity_type"::"text"::"public"."favorites_entity_type_enum"`
        );
        await queryRunner.query(
            `DROP TYPE "public"."favorites_entity_type_enum_old"`
        );
        await queryRunner.query(
            `ALTER TABLE "likes" ADD CONSTRAINT "likes_unique" UNIQUE ("user_id", "entity_type", "entity_id")`
        );
        await queryRunner.query(
            `ALTER TABLE "favorites" ADD CONSTRAINT "favorites_unique" UNIQUE ("user_id", "entity_type", "entity_id")`
        );
        await queryRunner.query(
            `ALTER TABLE "photo_sessions" ADD CONSTRAINT "FK_fed0f0a597481c4177c74986186" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "photo_sessions" ADD CONSTRAINT "FK_2f47321de81d1726f2477f691b1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "photo_sessions" ADD CONSTRAINT "FK_77e887ed36e330b60f899380b9e" FOREIGN KEY ("preview_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "photo_session_files" ADD CONSTRAINT "FK_54add29297a137aa0de67e8d1b6" FOREIGN KEY ("photo_session_id") REFERENCES "photo_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "photo_session_files" ADD CONSTRAINT "FK_713d6bf63e7a909508c5830341c" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "photo_session_team" ADD CONSTRAINT "FK_caf5869411476482388e53692b9" FOREIGN KEY ("photo_session_id") REFERENCES "photo_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "photo_session_team" ADD CONSTRAINT "FK_fbeb8742f6a20d7f38cad480587" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "photo_session_team" DROP CONSTRAINT "FK_fbeb8742f6a20d7f38cad480587"`
        );
        await queryRunner.query(
            `ALTER TABLE "photo_session_team" DROP CONSTRAINT "FK_caf5869411476482388e53692b9"`
        );
        await queryRunner.query(
            `ALTER TABLE "photo_session_files" DROP CONSTRAINT "FK_713d6bf63e7a909508c5830341c"`
        );
        await queryRunner.query(
            `ALTER TABLE "photo_session_files" DROP CONSTRAINT "FK_54add29297a137aa0de67e8d1b6"`
        );
        await queryRunner.query(
            `ALTER TABLE "photo_sessions" DROP CONSTRAINT "FK_77e887ed36e330b60f899380b9e"`
        );
        await queryRunner.query(
            `ALTER TABLE "photo_sessions" DROP CONSTRAINT "FK_2f47321de81d1726f2477f691b1"`
        );
        await queryRunner.query(
            `ALTER TABLE "photo_sessions" DROP CONSTRAINT "FK_fed0f0a597481c4177c74986186"`
        );
        await queryRunner.query(
            `ALTER TABLE "favorites" DROP CONSTRAINT "favorites_unique"`
        );
        await queryRunner.query(
            `ALTER TABLE "likes" DROP CONSTRAINT "likes_unique"`
        );
        await queryRunner.query(
            `CREATE TYPE "public"."favorites_entity_type_enum_old" AS ENUM('user', 'photo', 'place')`
        );
        await queryRunner.query(
            `ALTER TABLE "favorites" ALTER COLUMN "entity_type" TYPE "public"."favorites_entity_type_enum_old" USING "entity_type"::"text"::"public"."favorites_entity_type_enum_old"`
        );
        await queryRunner.query(
            `DROP TYPE "public"."favorites_entity_type_enum"`
        );
        await queryRunner.query(
            `ALTER TYPE "public"."favorites_entity_type_enum_old" RENAME TO "favorites_entity_type_enum"`
        );
        await queryRunner.query(
            `ALTER TABLE "favorites" ADD CONSTRAINT "favorites_unique" UNIQUE ("user_id", "entity_type", "entity_id")`
        );
        await queryRunner.query(
            `CREATE TYPE "public"."likes_entity_type_enum_old" AS ENUM('user', 'photo', 'place')`
        );
        await queryRunner.query(
            `ALTER TABLE "likes" ALTER COLUMN "entity_type" TYPE "public"."likes_entity_type_enum_old" USING "entity_type"::"text"::"public"."likes_entity_type_enum_old"`
        );
        await queryRunner.query(`DROP TYPE "public"."likes_entity_type_enum"`);
        await queryRunner.query(
            `ALTER TYPE "public"."likes_entity_type_enum_old" RENAME TO "likes_entity_type_enum"`
        );
        await queryRunner.query(
            `ALTER TABLE "likes" ADD CONSTRAINT "likes_unique" UNIQUE ("user_id", "entity_type", "entity_id")`
        );
        await queryRunner.query(
            `CREATE TYPE "public"."reviews_entity_type_enum_old" AS ENUM('user', 'photo', 'place')`
        );
        await queryRunner.query(
            `ALTER TABLE "reviews" ALTER COLUMN "entity_type" TYPE "public"."reviews_entity_type_enum_old" USING "entity_type"::"text"::"public"."reviews_entity_type_enum_old"`
        );
        await queryRunner.query(
            `DROP TYPE "public"."reviews_entity_type_enum"`
        );
        await queryRunner.query(
            `ALTER TYPE "public"."reviews_entity_type_enum_old" RENAME TO "reviews_entity_type_enum"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_fbeb8742f6a20d7f38cad48058"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_caf5869411476482388e53692b"`
        );
        await queryRunner.query(`DROP TABLE "photo_session_team"`);
        await queryRunner.query(
            `DROP INDEX "public"."IDX_713d6bf63e7a909508c5830341"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_54add29297a137aa0de67e8d1b"`
        );
        await queryRunner.query(`DROP TABLE "photo_session_files"`);
        await queryRunner.query(`DROP TABLE "photo_sessions"`);
    }
}
