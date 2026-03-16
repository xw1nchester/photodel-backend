import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1773665686929 implements MigrationInterface {
    name = 'Migration1773665686929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "places" ("id" SERIAL NOT NULL, "coordinates" geography(Point,4326) NOT NULL, "country" character varying NOT NULL, "city" character varying NOT NULL, CONSTRAINT "UQ_2ba4f599235486b992ff2727a0f" UNIQUE ("country", "city"), CONSTRAINT "PK_1afab86e226b4c3bc9a74465c12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "locations" ADD "place_id" integer`);
        await queryRunner.query(`ALTER TABLE "locations" ADD CONSTRAINT "FK_c04ee60f56e6b268a329b7c2cda" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "locations" DROP CONSTRAINT "FK_c04ee60f56e6b268a329b7c2cda"`);
        await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "place_id"`);
        await queryRunner.query(`DROP TABLE "places"`);
    }

}
