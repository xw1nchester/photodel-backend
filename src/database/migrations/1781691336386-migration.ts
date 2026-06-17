import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeDeleteForProfileSpecializationRelation1781691336386 implements MigrationInterface {
    name = 'AddCascadeDeleteForProfileSpecializationRelation1781691336386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "specializations_profiles" DROP CONSTRAINT "FK_058fad78d68c2f45c962c52fab8"`);
        await queryRunner.query(`ALTER TABLE "specializations_profiles" ADD CONSTRAINT "FK_058fad78d68c2f45c962c52fab8" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "specializations_profiles" DROP CONSTRAINT "FK_058fad78d68c2f45c962c52fab8"`);
        await queryRunner.query(`ALTER TABLE "specializations_profiles" ADD CONSTRAINT "FK_058fad78d68c2f45c962c52fab8" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
