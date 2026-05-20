import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDailyBestPhotoTable1779294388418 implements MigrationInterface {
    name = 'AddDailyBestPhotoTable1779294388418'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "daily_best_photos" ("id" SERIAL NOT NULL, "start_date" date NOT NULL, "photo_id" integer NOT NULL, CONSTRAINT "PK_e943cc0674dd325544d98f732e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "daily_best_photos" ADD CONSTRAINT "FK_5a489f370fc949d5e4702244311" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_best_photos" DROP CONSTRAINT "FK_5a489f370fc949d5e4702244311"`);
        await queryRunner.query(`DROP TABLE "daily_best_photos"`);
    }

}
