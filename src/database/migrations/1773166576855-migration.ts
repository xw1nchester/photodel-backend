import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameLocationAndDateColumns1773166576855 implements MigrationInterface {
    name = 'RenameLocationAndDateColumns1773166576855';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "photos" DROP CONSTRAINT "FK_345992cb2284a3851e458492851"`
        );
        await queryRunner.query(
            `ALTER TABLE "photos" RENAME COLUMN "locationId" TO "location_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" RENAME COLUMN "startDate" TO "start_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" RENAME COLUMN "endDate" TO "end_date"`
        );
        await queryRunner.query(
            `ALTER TABLE "photos" ADD CONSTRAINT "FK_c8df123d8c7d04052a9c15c8c1e" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "photos" DROP CONSTRAINT "FK_c8df123d8c7d04052a9c15c8c1e"`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" RENAME COLUMN "start_date" TO "startDate"`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" RENAME COLUMN "end_date" TO "endDate"`
        );
        await queryRunner.query(
            `ALTER TABLE "photos" RENAME COLUMN "location_id" TO "locationId"`
        );
        await queryRunner.query(
            `ALTER TABLE "photos" ADD CONSTRAINT "FK_345992cb2284a3851e458492851" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
    }
}
