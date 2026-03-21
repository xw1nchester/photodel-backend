import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRelationToFilmingLocationsTable1774100930503 implements MigrationInterface {
    name = 'AddUserRelationToFilmingLocationsTable1774100930503';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "filming_locations" ADD "user_id" integer NOT NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "favorites" DROP CONSTRAINT "favorites_unique"`
        );
        await queryRunner.query(
            `ALTER TYPE "public"."favorites_entity_type_enum" RENAME TO "favorites_entity_type_enum_old"`
        );
        await queryRunner.query(
            `CREATE TYPE "public"."favorites_entity_type_enum" AS ENUM('user', 'album', 'photo', 'place')`
        );
        await queryRunner.query(
            `ALTER TABLE "favorites" ALTER COLUMN "entity_type" TYPE "public"."favorites_entity_type_enum" USING "entity_type"::"text"::"public"."favorites_entity_type_enum"`
        );
        await queryRunner.query(
            `DROP TYPE "public"."favorites_entity_type_enum_old"`
        );
        await queryRunner.query(
            `ALTER TABLE "favorites" ADD CONSTRAINT "favorites_unique" UNIQUE ("user_id", "entity_type", "entity_id")`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_locations" ADD CONSTRAINT "FK_5b13ba9550dcdf7ecf1205bfae2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "filming_locations" DROP CONSTRAINT "FK_5b13ba9550dcdf7ecf1205bfae2"`
        );
        await queryRunner.query(
            `ALTER TABLE "favorites" DROP CONSTRAINT "favorites_unique"`
        );
        await queryRunner.query(
            `CREATE TYPE "public"."favorites_entity_type_enum_old" AS ENUM('user', 'album', 'photo')`
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
            `ALTER TABLE "filming_locations" DROP COLUMN "user_id"`
        );
    }
}
