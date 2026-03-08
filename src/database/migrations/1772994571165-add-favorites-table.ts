import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFavoritesTable1772994571165 implements MigrationInterface {
    name = 'AddFavoritesTable1772994571165';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."favorites_entity_type_enum" AS ENUM('user', 'photo')`
        );
        await queryRunner.query(
            `CREATE TABLE "favorites" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "entity_type" "public"."favorites_entity_type_enum" NOT NULL, "entity_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "favorites_unique" UNIQUE ("user_id", "entity_type", "entity_id"), CONSTRAINT "PK_890818d27523748dd36a4d1bdc8" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "favorites" ADD CONSTRAINT "FK_35a6b05ee3b624d0de01ee50593" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "favorites" DROP CONSTRAINT "FK_35a6b05ee3b624d0de01ee50593"`
        );
        await queryRunner.query(`DROP TABLE "favorites"`);
        await queryRunner.query(
            `DROP TYPE "public"."favorites_entity_type_enum"`
        );
    }
}
