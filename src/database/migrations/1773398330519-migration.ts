import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1773398330519 implements MigrationInterface {
    name = 'Migration1773398330519';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "favorites" DROP CONSTRAINT "favorites_unique"`
        );
        await queryRunner.query(
            `ALTER TYPE "public"."favorites_entity_type_enum" RENAME TO "favorites_entity_type_enum_old"`
        );
        await queryRunner.query(
            `CREATE TYPE "public"."favorites_entity_type_enum" AS ENUM('user', 'album', 'photo')`
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "favorites" DROP CONSTRAINT "favorites_unique"`
        );
        await queryRunner.query(
            `CREATE TYPE "public"."favorites_entity_type_enum_old" AS ENUM('user', 'photo')`
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
    }
}
