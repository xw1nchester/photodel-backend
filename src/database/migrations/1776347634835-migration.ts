import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlacesCoordinatesIndex1776347634835 implements MigrationInterface {
    name = 'AddPlacesCoordinatesIndex1776347634835';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "idx_places_coordinates"
            ON "places"
            USING GIST ("coordinates");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "idx_places_coordinates_;
        `);
    }
}
