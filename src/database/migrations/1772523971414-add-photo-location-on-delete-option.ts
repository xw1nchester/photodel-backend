import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhotoLocationOnDeleteOption1772523971414 implements MigrationInterface {
    name = 'AddPhotoLocationOnDeleteOption1772523971414';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "photos" DROP CONSTRAINT "FK_345992cb2284a3851e458492851"`
        );
        await queryRunner.query(
            `ALTER TABLE "photos" ADD CONSTRAINT "FK_345992cb2284a3851e458492851" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "photos" DROP CONSTRAINT "FK_345992cb2284a3851e458492851"`
        );
        await queryRunner.query(
            `ALTER TABLE "photos" ADD CONSTRAINT "FK_345992cb2284a3851e458492851" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }
}
