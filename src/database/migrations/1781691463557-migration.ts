import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeDeleteForProfileProCategoryRelation1781691463557 implements MigrationInterface {
    name = 'AddCascadeDeleteForProfileProCategoryRelation1781691463557'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pro_categories_profiles" DROP CONSTRAINT "FK_37d70c6d07e7ae61a46d33b20ca"`);
        await queryRunner.query(`ALTER TABLE "pro_categories_profiles" ADD CONSTRAINT "FK_37d70c6d07e7ae61a46d33b20ca" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pro_categories_profiles" DROP CONSTRAINT "FK_37d70c6d07e7ae61a46d33b20ca"`);
        await queryRunner.query(`ALTER TABLE "pro_categories_profiles" ADD CONSTRAINT "FK_37d70c6d07e7ae61a46d33b20ca" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
