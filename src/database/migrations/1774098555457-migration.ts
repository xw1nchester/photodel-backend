import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFilmingLocationsTable1774098555457 implements MigrationInterface {
    name = 'AddFilmingLocationsTable1774098555457';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "filming_locations" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "camera" character varying, "price" character varying, "conditions" character varying, "is_published" boolean NOT NULL DEFAULT false, "location_id" integer, CONSTRAINT "PK_85f7910b9689d2c1182ba983ae8" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "filming_locations_specializations" ("filming_location_id" integer NOT NULL, "specialization_id" integer NOT NULL, CONSTRAINT "PK_a3357bf64464332fe6a46915188" PRIMARY KEY ("filming_location_id", "specialization_id"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_28c2140a1068d328164cdbeb2b" ON "filming_locations_specializations" ("filming_location_id") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_04b8522ac4ed8ad253372ce803" ON "filming_locations_specializations" ("specialization_id") `
        );
        await queryRunner.query(
            `CREATE TABLE "filming_locations_files" ("filming_location_id" integer NOT NULL, "file_id" integer NOT NULL, CONSTRAINT "PK_e9861e46de63680bb6e1eb3da9a" PRIMARY KEY ("filming_location_id", "file_id"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_2b4fcf728d3d77ced96efb8e2c" ON "filming_locations_files" ("filming_location_id") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_3cbc3acabda4dd19bcd2443038" ON "filming_locations_files" ("file_id") `
        );
        await queryRunner.query(
            `ALTER TABLE "filming_locations" ADD CONSTRAINT "FK_0629abc980cee1c27678e99c7a7" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_locations_specializations" ADD CONSTRAINT "FK_28c2140a1068d328164cdbeb2b8" FOREIGN KEY ("filming_location_id") REFERENCES "filming_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_locations_specializations" ADD CONSTRAINT "FK_04b8522ac4ed8ad253372ce8032" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_locations_files" ADD CONSTRAINT "FK_2b4fcf728d3d77ced96efb8e2ce" FOREIGN KEY ("filming_location_id") REFERENCES "filming_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_locations_files" ADD CONSTRAINT "FK_3cbc3acabda4dd19bcd2443038c" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "filming_locations_files" DROP CONSTRAINT "FK_3cbc3acabda4dd19bcd2443038c"`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_locations_files" DROP CONSTRAINT "FK_2b4fcf728d3d77ced96efb8e2ce"`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_locations_specializations" DROP CONSTRAINT "FK_04b8522ac4ed8ad253372ce8032"`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_locations_specializations" DROP CONSTRAINT "FK_28c2140a1068d328164cdbeb2b8"`
        );
        await queryRunner.query(
            `ALTER TABLE "filming_locations" DROP CONSTRAINT "FK_0629abc980cee1c27678e99c7a7"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_3cbc3acabda4dd19bcd2443038"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_2b4fcf728d3d77ced96efb8e2c"`
        );
        await queryRunner.query(`DROP TABLE "filming_locations_files"`);
        await queryRunner.query(
            `DROP INDEX "public"."IDX_04b8522ac4ed8ad253372ce803"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_28c2140a1068d328164cdbeb2b"`
        );
        await queryRunner.query(
            `DROP TABLE "filming_locations_specializations"`
        );
        await queryRunner.query(`DROP TABLE "filming_locations"`);
    }
}
