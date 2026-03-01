import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeAlbumsImageOpt1772300965590 implements MigrationInterface {
    name = 'MakeAlbumsImageOpt1772300965590';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "albums" ALTER COLUMN "image" DROP NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "albums" ALTER COLUMN "image" SET NOT NULL`
        );
    }
}
