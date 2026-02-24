import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileLocation1771957614780 implements MigrationInterface {
    name = 'AddProfileLocation1771957614780';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "temporary_locations" ("id" SERIAL NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "coordinates" geography(Point,4326) NOT NULL, "comment" character varying, "profile_id" integer, CONSTRAINT "PK_c0a1c4786258a87653460d83dcd" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "profiles" ADD "coordinates" geography(Point,4326)`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" ADD CONSTRAINT "FK_55a90d74c5caefb731e144a4bfd" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" DROP CONSTRAINT "FK_55a90d74c5caefb731e144a4bfd"`
        );
        await queryRunner.query(
            `ALTER TABLE "profiles" DROP COLUMN "coordinates"`
        );
        await queryRunner.query(`DROP TABLE "temporary_locations"`);
    }
}
