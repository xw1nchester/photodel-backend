import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameImageColumnsToImageKey1773167751972 implements MigrationInterface {
    name = 'RenameImageColumnsToImageKey1773167751972';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "photos" RENAME COLUMN "image" TO "image_key"`
        );
        await queryRunner.query(
            `ALTER TABLE "albums" RENAME COLUMN "image" TO "image_key"`
        );
        await queryRunner.query(
            `ALTER TABLE "users" RENAME COLUMN "avatar" TO "avatar_key"`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" RENAME COLUMN "avatar_key" TO "avatar"`
        );
        await queryRunner.query(
            `ALTER TABLE "albums" RENAME COLUMN "image_key" TO "image"`
        );
        await queryRunner.query(
            `ALTER TABLE "photos" RENAME COLUMN "image_key" TO "image"`
        );
    }
}
