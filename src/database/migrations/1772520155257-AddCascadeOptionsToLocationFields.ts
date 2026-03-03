import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeOptionsToLocationFields1772520155257 implements MigrationInterface {
    name = 'AddCascadeOptionsToLocationFields1772520155257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temporary_locations" DROP CONSTRAINT "FK_f8719e9eec2d6b906e3e27aa83d"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_7a59daf6879b8b1623bace41f54"`);
        await queryRunner.query(`ALTER TABLE "temporary_locations" ADD CONSTRAINT "FK_f8719e9eec2d6b906e3e27aa83d" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_7a59daf6879b8b1623bace41f54" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_7a59daf6879b8b1623bace41f54"`);
        await queryRunner.query(`ALTER TABLE "temporary_locations" DROP CONSTRAINT "FK_f8719e9eec2d6b906e3e27aa83d"`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_7a59daf6879b8b1623bace41f54" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "temporary_locations" ADD CONSTRAINT "FK_f8719e9eec2d6b906e3e27aa83d" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
