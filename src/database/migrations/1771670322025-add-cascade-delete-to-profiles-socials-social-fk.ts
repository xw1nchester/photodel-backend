import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeDeleteToProfilesSocialsSocialFk1771670322025 implements MigrationInterface {
    name = 'AddCascadeDeleteToProfilesSocialsSocialFk1771670322025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles_socials" DROP CONSTRAINT "FK_4b14324063b47be836e09200313"`);
        await queryRunner.query(`ALTER TABLE "profiles_socials" DROP CONSTRAINT "FK_d577ea9c2bb7eb73e34cf074683"`);
        await queryRunner.query(`ALTER TABLE "profiles_socials" ADD CONSTRAINT "FK_d577ea9c2bb7eb73e34cf074683" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles_socials" ADD CONSTRAINT "FK_4b14324063b47be836e09200313" FOREIGN KEY ("social_id") REFERENCES "socials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles_socials" DROP CONSTRAINT "FK_4b14324063b47be836e09200313"`);
        await queryRunner.query(`ALTER TABLE "profiles_socials" DROP CONSTRAINT "FK_d577ea9c2bb7eb73e34cf074683"`);
        await queryRunner.query(`ALTER TABLE "profiles_socials" ADD CONSTRAINT "FK_d577ea9c2bb7eb73e34cf074683" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles_socials" ADD CONSTRAINT "FK_4b14324063b47be836e09200313" FOREIGN KEY ("social_id") REFERENCES "socials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
