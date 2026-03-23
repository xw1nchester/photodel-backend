import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriviewFileFieldToFilmingLocationsTable1774271120418 implements MigrationInterface {
    name = 'AddPriviewFileFieldToFilmingLocationsTable1774271120418';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "filming_locations" ADD "preview_file_id" integer`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_locations" ADD CONSTRAINT "FK_b1bf3dd40461811e6ece6121972" FOREIGN KEY ("preview_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "filming_locations" DROP CONSTRAINT "FK_b1bf3dd40461811e6ece6121972"`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_locations" DROP COLUMN "preview_file_id"`
        );
    }
}
