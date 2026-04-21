import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrainingEntityType1776760447754 implements MigrationInterface {
    name = 'TrainingEntityType1776760447754';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TYPE "public"."reviews_entity_type_enum" RENAME TO "reviews_entity_type_enum_old"`
        );
        await queryRunner.query(
            `CREATE TYPE "public"."reviews_entity_type_enum" AS ENUM('user', 'photo', 'place', 'photo_session', 'training')`
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
            `CREATE TYPE "public"."likes_entity_type_enum" AS ENUM('user', 'photo', 'place', 'photo_session', 'training')`
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
            `CREATE TYPE "public"."favorites_entity_type_enum" AS ENUM('user', 'photo', 'place', 'photo_session', 'training')`
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "favorites" DROP CONSTRAINT "favorites_unique"`
        );
        await queryRunner.query(
            `ALTER TABLE "likes" DROP CONSTRAINT "likes_unique"`
        );
        await queryRunner.query(
            `CREATE TYPE "public"."favorites_entity_type_enum_old" AS ENUM('user', 'photo', 'place', 'photo_session')`
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
            `CREATE TYPE "public"."likes_entity_type_enum_old" AS ENUM('user', 'photo', 'place', 'photo_session')`
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
            `CREATE TYPE "public"."reviews_entity_type_enum_old" AS ENUM('user', 'photo', 'place', 'photo_session')`
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
    }
}
