import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrainingRequestsTable1777273989468 implements MigrationInterface {
    name = 'AddTrainingRequestsTable1777273989468';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."training_requests_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'completed')`
        );
        await queryRunner.query(
            `CREATE TABLE "training_requests" ("id" SERIAL NOT NULL, "sender_user_id" integer NOT NULL, "receiver_user_id" integer NOT NULL, "training_id" integer NOT NULL, "status" "public"."training_requests_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b63534b199679e013128ef0ed28" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "training_requests" ADD CONSTRAINT "FK_9347421df218f92e5039cf723e5" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "training_requests" ADD CONSTRAINT "FK_6e8cfa0d8c2b2207f2ab39fdce9" FOREIGN KEY ("receiver_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "training_requests" ADD CONSTRAINT "FK_922e24a337ae35a5f31b053a7ff" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "training_requests" DROP CONSTRAINT "FK_922e24a337ae35a5f31b053a7ff"`
        );
        await queryRunner.query(
            `ALTER TABLE "training_requests" DROP CONSTRAINT "FK_6e8cfa0d8c2b2207f2ab39fdce9"`
        );
        await queryRunner.query(
            `ALTER TABLE "training_requests" DROP CONSTRAINT "FK_9347421df218f92e5039cf723e5"`
        );
        await queryRunner.query(`DROP TABLE "training_requests"`);
        await queryRunner.query(
            `DROP TYPE "public"."training_requests_status_enum"`
        );
    }
}
