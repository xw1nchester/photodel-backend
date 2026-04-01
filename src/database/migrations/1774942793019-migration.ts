import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReviewsTable1774942793019 implements MigrationInterface {
    name = 'AddReviewsTable1774942793019';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."reviews_entity_type_enum" AS ENUM('user', 'photo', 'place')`
        );
        await queryRunner.query(
            `CREATE TABLE "reviews" ("id" SERIAL NOT NULL, "content" character varying NOT NULL, "rating" integer, "is_published" boolean NOT NULL DEFAULT false, "user_id" integer NOT NULL, "entity_type" "public"."reviews_entity_type_enum" NOT NULL, "entity_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "reviews_files" ("review_id" integer NOT NULL, "file_id" integer NOT NULL, CONSTRAINT "PK_aeb07436b23a17375e2117828cf" PRIMARY KEY ("review_id", "file_id"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_a4d6d70ae14ee9531e196fbeaa" ON "reviews_files" ("review_id") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_8fe038ad1705e449f49044ea21" ON "reviews_files" ("file_id") `
        );
        await queryRunner.query(
            `ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "reviews_files" ADD CONSTRAINT "FK_a4d6d70ae14ee9531e196fbeaaf" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "reviews_files" ADD CONSTRAINT "FK_8fe038ad1705e449f49044ea21d" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "reviews_files" DROP CONSTRAINT "FK_8fe038ad1705e449f49044ea21d"`
        );
        await queryRunner.query(
            `ALTER TABLE "reviews_files" DROP CONSTRAINT "FK_a4d6d70ae14ee9531e196fbeaaf"`
        );
        await queryRunner.query(
            `ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_8fe038ad1705e449f49044ea21"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_a4d6d70ae14ee9531e196fbeaa"`
        );
        await queryRunner.query(`DROP TABLE "reviews_files"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(
            `DROP TYPE "public"."reviews_entity_type_enum"`
        );
    }
}
