import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFilmingRequestsTable1776153855170 implements MigrationInterface {
    name = 'AddFilmingRequestsTable1776153855170';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."filming_requests_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'completed')`
        );
        await queryRunner.query(
            `CREATE TABLE "filming_requests" ("id" SERIAL NOT NULL, "sender_user_id" integer NOT NULL, "receiver_user_id" integer NOT NULL, "status" "public"."filming_requests_status_enum" NOT NULL DEFAULT 'pending', "date" TIMESTAMP WITH TIME ZONE NOT NULL, "duration_hours" integer NOT NULL, "type" character varying NOT NULL, "peoples_count" integer NOT NULL, "budget" character varying NOT NULL, "needs_makeup_artist" boolean NOT NULL, "comment" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "location_id" integer, CONSTRAINT "PK_735f1a4e62f2077cc4b585d13b4" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_requests" ADD CONSTRAINT "FK_a9aee0ae9e6407dfe32bf170ab2" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_requests" ADD CONSTRAINT "FK_88b0640267c4940ec46e2d2845e" FOREIGN KEY ("receiver_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_requests" ADD CONSTRAINT "FK_49d3c665f4be67f7f32ae6a3b55" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "filming_requests" DROP CONSTRAINT "FK_49d3c665f4be67f7f32ae6a3b55"`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_requests" DROP CONSTRAINT "FK_88b0640267c4940ec46e2d2845e"`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_requests" DROP CONSTRAINT "FK_a9aee0ae9e6407dfe32bf170ab2"`
        );
        await queryRunner.query(`DROP TABLE "filming_requests"`);
        await queryRunner.query(
            `DROP TYPE "public"."filming_requests_status_enum"`
        );
    }
}
