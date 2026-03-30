import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLikesTable1774872601605 implements MigrationInterface {
    name = 'AddLikesTable1774872601605';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."likes_entity_type_enum" AS ENUM('user', 'photo', 'place')`
        );
        await queryRunner.query(
            `CREATE TABLE "likes" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "entity_type" "public"."likes_entity_type_enum" NOT NULL, "entity_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "likes_unique" UNIQUE ("user_id", "entity_type", "entity_id"), CONSTRAINT "PK_a9323de3f8bced7539a794b4a37" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "likes" ADD CONSTRAINT "FK_3f519ed95f775c781a254089171" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "likes" DROP CONSTRAINT "FK_3f519ed95f775c781a254089171"`
        );
        await queryRunner.query(`DROP TABLE "likes"`);
        await queryRunner.query(`DROP TYPE "public"."likes_entity_type_enum"`);
    }
}
