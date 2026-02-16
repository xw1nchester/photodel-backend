import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1771244106845 implements MigrationInterface {
    name = 'Auto1771244106845'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."codes_type_enum" AS ENUM('verification', 'password_recovery', 'password_change')`);
        await queryRunner.query(`CREATE TABLE "codes" ("id" SERIAL NOT NULL, "type" "public"."codes_type_enum" NOT NULL, "code" character varying NOT NULL, "retry_date" TIMESTAMP NOT NULL, "expiry_date" TIMESTAMP NOT NULL, "user_id" integer, CONSTRAINT "PK_9b85c624e2d705f4e8a9b64dbf4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "codes" ADD CONSTRAINT "FK_4faaad086955b535c6fe27dbdf2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "codes" DROP CONSTRAINT "FK_4faaad086955b535c6fe27dbdf2"`);
        await queryRunner.query(`DROP TABLE "codes"`);
        await queryRunner.query(`DROP TYPE "public"."codes_type_enum"`);
    }

}
