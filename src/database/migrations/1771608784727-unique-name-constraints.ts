import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueNameConstraints1771608784727 implements MigrationInterface {
    name = 'UniqueNameConstraints1771608784727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pro_categories_specializations" DROP CONSTRAINT "FK_08641ddc6dd642e720ffa899e78"`);
        await queryRunner.query(`ALTER TABLE "pro_categories_specializations" DROP CONSTRAINT "FK_3e176d326c68b89c900524cc7fc"`);
        await queryRunner.query(`ALTER TABLE "pro_categories_profiles" DROP CONSTRAINT "FK_37d70c6d07e7ae61a46d33b20ca"`);
        await queryRunner.query(`ALTER TABLE "pro_categories_profiles" DROP CONSTRAINT "FK_cbeda55ab5d2e355d640e3f49a7"`);
        await queryRunner.query(`ALTER TABLE "specializations_profiles" DROP CONSTRAINT "FK_058fad78d68c2f45c962c52fab8"`);
        await queryRunner.query(`ALTER TABLE "specializations_profiles" DROP CONSTRAINT "FK_3e004f4e54f12a49fe5fe83db91"`);
        await queryRunner.query(`ALTER TABLE "specializations" ADD CONSTRAINT "UQ_68ccfdea9eca4570f9aa5454b25" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "pro_categories" ADD CONSTRAINT "UQ_372761df3d7a055ed414798ea0d" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "socials" ADD CONSTRAINT "UQ_8c1347766cbb0fe419f404c0d6c" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "pro_categories_specializations" ADD CONSTRAINT "FK_3e176d326c68b89c900524cc7fc" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "pro_categories_specializations" ADD CONSTRAINT "FK_08641ddc6dd642e720ffa899e78" FOREIGN KEY ("pro_category_id") REFERENCES "pro_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "specializations_profiles" ADD CONSTRAINT "FK_3e004f4e54f12a49fe5fe83db91" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "specializations_profiles" ADD CONSTRAINT "FK_058fad78d68c2f45c962c52fab8" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pro_categories_profiles" ADD CONSTRAINT "FK_cbeda55ab5d2e355d640e3f49a7" FOREIGN KEY ("pro_category_id") REFERENCES "pro_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "pro_categories_profiles" ADD CONSTRAINT "FK_37d70c6d07e7ae61a46d33b20ca" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pro_categories_profiles" DROP CONSTRAINT "FK_37d70c6d07e7ae61a46d33b20ca"`);
        await queryRunner.query(`ALTER TABLE "pro_categories_profiles" DROP CONSTRAINT "FK_cbeda55ab5d2e355d640e3f49a7"`);
        await queryRunner.query(`ALTER TABLE "specializations_profiles" DROP CONSTRAINT "FK_058fad78d68c2f45c962c52fab8"`);
        await queryRunner.query(`ALTER TABLE "specializations_profiles" DROP CONSTRAINT "FK_3e004f4e54f12a49fe5fe83db91"`);
        await queryRunner.query(`ALTER TABLE "pro_categories_specializations" DROP CONSTRAINT "FK_08641ddc6dd642e720ffa899e78"`);
        await queryRunner.query(`ALTER TABLE "pro_categories_specializations" DROP CONSTRAINT "FK_3e176d326c68b89c900524cc7fc"`);
        await queryRunner.query(`ALTER TABLE "socials" DROP CONSTRAINT "UQ_8c1347766cbb0fe419f404c0d6c"`);
        await queryRunner.query(`ALTER TABLE "pro_categories" DROP CONSTRAINT "UQ_372761df3d7a055ed414798ea0d"`);
        await queryRunner.query(`ALTER TABLE "specializations" DROP CONSTRAINT "UQ_68ccfdea9eca4570f9aa5454b25"`);
        await queryRunner.query(`ALTER TABLE "specializations_profiles" ADD CONSTRAINT "FK_3e004f4e54f12a49fe5fe83db91" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "specializations_profiles" ADD CONSTRAINT "FK_058fad78d68c2f45c962c52fab8" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pro_categories_profiles" ADD CONSTRAINT "FK_cbeda55ab5d2e355d640e3f49a7" FOREIGN KEY ("pro_category_id") REFERENCES "pro_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "pro_categories_profiles" ADD CONSTRAINT "FK_37d70c6d07e7ae61a46d33b20ca" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pro_categories_specializations" ADD CONSTRAINT "FK_3e176d326c68b89c900524cc7fc" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "pro_categories_specializations" ADD CONSTRAINT "FK_08641ddc6dd642e720ffa899e78" FOREIGN KEY ("pro_category_id") REFERENCES "pro_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
