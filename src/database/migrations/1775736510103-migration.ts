import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhotoSessionSpecializtionField1775736510103 implements MigrationInterface {
    name = 'AddPhotoSessionSpecializtionField1775736510103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "photo_sessions" RENAME COLUMN "type" TO "specialization_id"`);
        await queryRunner.query(`ALTER TABLE "photo_sessions" DROP COLUMN "specialization_id"`);
        await queryRunner.query(`ALTER TABLE "photo_sessions" ADD "specialization_id" integer`);
        await queryRunner.query(`ALTER TABLE "photo_sessions" ADD CONSTRAINT "FK_f22ce6db7c767fed9027f1e69e0" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "photo_sessions" DROP CONSTRAINT "FK_f22ce6db7c767fed9027f1e69e0"`);
        await queryRunner.query(`ALTER TABLE "photo_sessions" DROP COLUMN "specialization_id"`);
        await queryRunner.query(`ALTER TABLE "photo_sessions" ADD "specialization_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "photo_sessions" RENAME COLUMN "specialization_id" TO "type"`);
    }

}
