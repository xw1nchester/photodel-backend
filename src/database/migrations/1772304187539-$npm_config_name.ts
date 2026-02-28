import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1772304187539 implements MigrationInterface {
    name = ' $npmConfigName1772304187539';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "photos" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "camera" character varying, "aperture" character varying, "focal_length" character varying, "shutter_speed" character varying, "iso" integer, "flash" character varying, "is_for_sale" boolean NOT NULL DEFAULT false, "is_published" boolean NOT NULL DEFAULT false, "user_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "locationId" integer, CONSTRAINT "PK_5220c45b8e32d49d767b9b3d725" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "photos_specializations" ("photo_id" integer NOT NULL, "specialization_id" integer NOT NULL, CONSTRAINT "PK_937502158d701bec6ceb401c62d" PRIMARY KEY ("photo_id", "specialization_id"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_bf58b4a4df272c75e373e2ab85" ON "photos_specializations" ("photo_id") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_890c5c29f4f2e505f344851931" ON "photos_specializations" ("specialization_id") `
        );
        await queryRunner.query(
            `CREATE TABLE "photos_albums" ("photo_id" integer NOT NULL, "album_id" integer NOT NULL, CONSTRAINT "PK_8af6e6a77b3c9ffb2427652c346" PRIMARY KEY ("photo_id", "album_id"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_86ab8a89de398a829595cadaa0" ON "photos_albums" ("photo_id") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_55f6d9def8277877d5dab4b21d" ON "photos_albums" ("album_id") `
        );
        await queryRunner.query(
            `ALTER TABLE "photos" ADD CONSTRAINT "FK_345992cb2284a3851e458492851" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "photos" ADD CONSTRAINT "FK_c4404a2ee605249b508c623e68f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "photos_specializations" ADD CONSTRAINT "FK_bf58b4a4df272c75e373e2ab85c" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "photos_specializations" ADD CONSTRAINT "FK_890c5c29f4f2e505f3448519314" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "photos_albums" ADD CONSTRAINT "FK_86ab8a89de398a829595cadaa01" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "photos_albums" ADD CONSTRAINT "FK_55f6d9def8277877d5dab4b21d6" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "photos_albums" DROP CONSTRAINT "FK_55f6d9def8277877d5dab4b21d6"`
        );
        await queryRunner.query(
            `ALTER TABLE "photos_albums" DROP CONSTRAINT "FK_86ab8a89de398a829595cadaa01"`
        );
        await queryRunner.query(
            `ALTER TABLE "photos_specializations" DROP CONSTRAINT "FK_890c5c29f4f2e505f3448519314"`
        );
        await queryRunner.query(
            `ALTER TABLE "photos_specializations" DROP CONSTRAINT "FK_bf58b4a4df272c75e373e2ab85c"`
        );
        await queryRunner.query(
            `ALTER TABLE "photos" DROP CONSTRAINT "FK_c4404a2ee605249b508c623e68f"`
        );
        await queryRunner.query(
            `ALTER TABLE "photos" DROP CONSTRAINT "FK_345992cb2284a3851e458492851"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_55f6d9def8277877d5dab4b21d"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_86ab8a89de398a829595cadaa0"`
        );
        await queryRunner.query(`DROP TABLE "photos_albums"`);
        await queryRunner.query(
            `DROP INDEX "public"."IDX_890c5c29f4f2e505f344851931"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_bf58b4a4df272c75e373e2ab85"`
        );
        await queryRunner.query(`DROP TABLE "photos_specializations"`);
        await queryRunner.query(`DROP TABLE "photos"`);
    }
}
