import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrainingsTable1776757031989 implements MigrationInterface {
    name = 'AddTrainingsTable1776757031989';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "trainings" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "type" character varying NOT NULL, "format" character varying NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "price" character varying NOT NULL, "prepayment" character varying NOT NULL, "is_published" boolean NOT NULL DEFAULT false, "user_id" integer NOT NULL, "preview_file_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "location_id" integer, CONSTRAINT "PK_b67237502b175163e47dc85018d" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "training_files" ("training_id" integer NOT NULL, "file_id" integer NOT NULL, CONSTRAINT "PK_1a7e2ea52d3a15dd11fe4c16189" PRIMARY KEY ("training_id", "file_id"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_45b47bbc8760ca706a3957b677" ON "training_files" ("training_id") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_e07d04339d267ebd8da10b7c1f" ON "training_files" ("file_id") `
        );
        await queryRunner.query(
            `CREATE TABLE "training_organizers" ("training_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_f87af82f8bcdd3e339b9b7e731e" PRIMARY KEY ("training_id", "user_id"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_9bfc759cc00fd0c65d31451ed2" ON "training_organizers" ("training_id") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_51c6f1693a2046351d3428961e" ON "training_organizers" ("user_id") `
        );
        await queryRunner.query(
            `CREATE TABLE "training_team" ("training_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_7940be4a6070cae1c28cfb0c83e" PRIMARY KEY ("training_id", "user_id"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_ff1ca96f3a051d39c04975f6b2" ON "training_team" ("training_id") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_b676a42f338614ad1f2b29103b" ON "training_team" ("user_id") `
        );
        await queryRunner.query(
            `ALTER TABLE "trainings" ADD CONSTRAINT "FK_1feb317458559853ef98de25279" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "trainings" ADD CONSTRAINT "FK_0a6488e45e7e8ed7d5f69e0dead" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "trainings" ADD CONSTRAINT "FK_f081d4d4bf16860fd4a9bf3fe53" FOREIGN KEY ("preview_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "training_files" ADD CONSTRAINT "FK_45b47bbc8760ca706a3957b6776" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "training_files" ADD CONSTRAINT "FK_e07d04339d267ebd8da10b7c1f9" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "training_organizers" ADD CONSTRAINT "FK_9bfc759cc00fd0c65d31451ed23" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "training_organizers" ADD CONSTRAINT "FK_51c6f1693a2046351d3428961ea" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "training_team" ADD CONSTRAINT "FK_ff1ca96f3a051d39c04975f6b20" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "training_team" ADD CONSTRAINT "FK_b676a42f338614ad1f2b29103b1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "training_team" DROP CONSTRAINT "FK_b676a42f338614ad1f2b29103b1"`
        );
        await queryRunner.query(
            `ALTER TABLE "training_team" DROP CONSTRAINT "FK_ff1ca96f3a051d39c04975f6b20"`
        );
        await queryRunner.query(
            `ALTER TABLE "training_organizers" DROP CONSTRAINT "FK_51c6f1693a2046351d3428961ea"`
        );
        await queryRunner.query(
            `ALTER TABLE "training_organizers" DROP CONSTRAINT "FK_9bfc759cc00fd0c65d31451ed23"`
        );
        await queryRunner.query(
            `ALTER TABLE "training_files" DROP CONSTRAINT "FK_e07d04339d267ebd8da10b7c1f9"`
        );
        await queryRunner.query(
            `ALTER TABLE "training_files" DROP CONSTRAINT "FK_45b47bbc8760ca706a3957b6776"`
        );
        await queryRunner.query(
            `ALTER TABLE "trainings" DROP CONSTRAINT "FK_f081d4d4bf16860fd4a9bf3fe53"`
        );
        await queryRunner.query(
            `ALTER TABLE "trainings" DROP CONSTRAINT "FK_0a6488e45e7e8ed7d5f69e0dead"`
        );
        await queryRunner.query(
            `ALTER TABLE "trainings" DROP CONSTRAINT "FK_1feb317458559853ef98de25279"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_b676a42f338614ad1f2b29103b"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_ff1ca96f3a051d39c04975f6b2"`
        );
        await queryRunner.query(`DROP TABLE "training_team"`);
        await queryRunner.query(
            `DROP INDEX "public"."IDX_51c6f1693a2046351d3428961e"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_9bfc759cc00fd0c65d31451ed2"`
        );
        await queryRunner.query(`DROP TABLE "training_organizers"`);
        await queryRunner.query(
            `DROP INDEX "public"."IDX_e07d04339d267ebd8da10b7c1f"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_45b47bbc8760ca706a3957b677"`
        );
        await queryRunner.query(`DROP TABLE "training_files"`);
        await queryRunner.query(`DROP TABLE "trainings"`);
    }
}
