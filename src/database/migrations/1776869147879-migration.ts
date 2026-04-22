import { MigrationInterface, QueryRunner } from "typeorm";

export class MaxParticipantsTrainingField1776869147879 implements MigrationInterface {
    name = 'MaxParticipantsTrainingField1776869147879'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trainings" ADD "max_participants" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trainings" DROP COLUMN "max_participants"`);
    }

}
