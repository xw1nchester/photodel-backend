import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdTokenPrimary1771355279026 implements MigrationInterface {
    name = 'UpdTokenPrimary1771355279026'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "PK_4542dd2f38a61354a040ba9fd57"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "PK_b04e52fb0940cbfd2b965bf3ac1" PRIMARY KEY ("token", "id")`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "PK_b04e52fb0940cbfd2b965bf3ac1"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57" UNIQUE ("token")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "PK_7d8bee0204106019488c4c50ffa"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "PK_b04e52fb0940cbfd2b965bf3ac1" PRIMARY KEY ("token", "id")`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "PK_b04e52fb0940cbfd2b965bf3ac1"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "PK_4542dd2f38a61354a040ba9fd57" PRIMARY KEY ("token")`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "id"`);
    }

}
