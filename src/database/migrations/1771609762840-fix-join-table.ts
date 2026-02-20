import { MigrationInterface, QueryRunner } from "typeorm";

export class FixJoinTable1771609762840 implements MigrationInterface {
    name = 'FixJoinTable1771609762840'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pro_categories_specializations" DROP CONSTRAINT "FK_08641ddc6dd642e720ffa899e78"`);
        await queryRunner.query(`ALTER TABLE "pro_categories_specializations" DROP CONSTRAINT "FK_3e176d326c68b89c900524cc7fc"`);
        await queryRunner.query(`ALTER TABLE "pro_categories_specializations" ADD CONSTRAINT "FK_08641ddc6dd642e720ffa899e78" FOREIGN KEY ("pro_category_id") REFERENCES "pro_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "pro_categories_specializations" ADD CONSTRAINT "FK_3e176d326c68b89c900524cc7fc" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pro_categories_specializations" DROP CONSTRAINT "FK_3e176d326c68b89c900524cc7fc"`);
        await queryRunner.query(`ALTER TABLE "pro_categories_specializations" DROP CONSTRAINT "FK_08641ddc6dd642e720ffa899e78"`);
        await queryRunner.query(`ALTER TABLE "pro_categories_specializations" ADD CONSTRAINT "FK_3e176d326c68b89c900524cc7fc" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "pro_categories_specializations" ADD CONSTRAINT "FK_08641ddc6dd642e720ffa899e78" FOREIGN KEY ("pro_category_id") REFERENCES "pro_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
