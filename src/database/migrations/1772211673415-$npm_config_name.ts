import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1772211673415 implements MigrationInterface {
    name = ' $npmConfigName1772211673415';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" RENAME COLUMN "coordinates" TO "location_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "profiles" RENAME COLUMN "coordinates" TO "location_id"`
        );
        await queryRunner.query(
            `CREATE TABLE "locations" ("id" SERIAL NOT NULL, "coordinates" geography(Point,4326) NOT NULL, "country" character varying, "city" character varying, "street" character varying, "house_number" character varying, CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" DROP COLUMN "location_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" ADD "location_id" integer`
        );
        await queryRunner.query(
            `ALTER TABLE "profiles" DROP COLUMN "location_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "profiles" ADD "location_id" integer`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" ADD CONSTRAINT "FK_f8719e9eec2d6b906e3e27aa83d" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "profiles" ADD CONSTRAINT "FK_7a59daf6879b8b1623bace41f54" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "profiles" DROP CONSTRAINT "FK_7a59daf6879b8b1623bace41f54"`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" DROP CONSTRAINT "FK_f8719e9eec2d6b906e3e27aa83d"`
        );
        await queryRunner.query(
            `ALTER TABLE "profiles" DROP COLUMN "location_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "profiles" ADD "location_id" geography(Point,4326)`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" DROP COLUMN "location_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" ADD "location_id" geography(Point,4326) NOT NULL`
        );
        await queryRunner.query(`DROP TABLE "locations"`);
        await queryRunner.query(
            `ALTER TABLE "profiles" RENAME COLUMN "location_id" TO "coordinates"`
        );
        await queryRunner.query(
            `ALTER TABLE "temporary_locations" RENAME COLUMN "location_id" TO "coordinates"`
        );
    }
}
