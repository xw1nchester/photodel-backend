import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1771163246422 implements MigrationInterface {
    name = 'Auto1771163246422'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("token" character varying NOT NULL, "expiry_date" TIMESTAMP NOT NULL, "user_agent" character varying NOT NULL, "user_id" integer, CONSTRAINT "PK_4542dd2f38a61354a040ba9fd57" PRIMARY KEY ("token"))`);
        await queryRunner.query(`CREATE TABLE "specializations" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "parent_id" integer, CONSTRAINT "PK_1d4b2b9ff96a76def0bf7195a8f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "phone" character varying, "password_hash" character varying NOT NULL, "is_adult" boolean NOT NULL, "is_professional" boolean NOT NULL, "is_verified" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "specialization_id" integer, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "specializations_closure" ("id_ancestor" integer NOT NULL, "id_descendant" integer NOT NULL, CONSTRAINT "PK_1c13a82ada3b74e587186f02325" PRIMARY KEY ("id_ancestor", "id_descendant"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0958948c90345e269b2cef872c" ON "specializations_closure" ("id_ancestor") `);
        await queryRunner.query(`CREATE INDEX "IDX_b3f1545b7ee067ac8fd8e04a16" ON "specializations_closure" ("id_descendant") `);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "specializations" ADD CONSTRAINT "FK_2d60d0ed0872f9085b39c42fee0" FOREIGN KEY ("parent_id") REFERENCES "specializations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_34c87782de317e88ef117a20dc0" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "specializations_closure" ADD CONSTRAINT "FK_0958948c90345e269b2cef872cc" FOREIGN KEY ("id_ancestor") REFERENCES "specializations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "specializations_closure" ADD CONSTRAINT "FK_b3f1545b7ee067ac8fd8e04a161" FOREIGN KEY ("id_descendant") REFERENCES "specializations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "specializations_closure" DROP CONSTRAINT "FK_b3f1545b7ee067ac8fd8e04a161"`);
        await queryRunner.query(`ALTER TABLE "specializations_closure" DROP CONSTRAINT "FK_0958948c90345e269b2cef872cc"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_34c87782de317e88ef117a20dc0"`);
        await queryRunner.query(`ALTER TABLE "specializations" DROP CONSTRAINT "FK_2d60d0ed0872f9085b39c42fee0"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b3f1545b7ee067ac8fd8e04a16"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0958948c90345e269b2cef872c"`);
        await queryRunner.query(`DROP TABLE "specializations_closure"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "specializations"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    }

}
