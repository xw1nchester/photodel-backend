import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampsFiledsToFilingLocationsTable1774101108463 implements MigrationInterface {
    name = 'AddTimestampsFiledsToFilingLocationsTable1774101108463';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "filming_locations" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_locations" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "filming_locations" DROP COLUMN "updated_at"`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_locations" DROP COLUMN "created_at"`
        );
    }
}
