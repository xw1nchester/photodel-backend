import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1773235574381 implements MigrationInterface {
    name = 'Migration1773235574381';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "locations" RENAME COLUMN "country" TO "address"`
        );
        await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "street"`);
        await queryRunner.query(
            `ALTER TABLE "locations" DROP COLUMN "house_number"`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "locations" RENAME COLUMN "address" TO "country"`
        );
        await queryRunner.query(
            `ALTER TABLE "locations" ADD "house_number" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "locations" ADD "street" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "locations" ADD "city" character varying`
        );
    }
}
