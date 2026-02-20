import { MigrationInterface, QueryRunner } from "typeorm";

export class ProfileNullableFields1771612936556 implements MigrationInterface {
    name = 'ProfileNullableFields1771612936556'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "price" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "conditions" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "equipment" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "geography" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "languages" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "about" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "about" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "languages" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "geography" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "equipment" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "conditions" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profiles" ALTER COLUMN "price" SET NOT NULL`);
    }

}
