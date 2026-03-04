import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhotoImageField1772625414026 implements MigrationInterface {
    name = 'AddPhotoImageField1772625414026';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "photos" ADD "image" character varying NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "photos" DROP COLUMN "image"`);
    }
}
