import { MigrationInterface, QueryRunner } from "typeorm";

export class ProfileFields1771606807937 implements MigrationInterface {
    name = 'ProfileFields1771606807937'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "specializations" DROP CONSTRAINT "FK_2d60d0ed0872f9085b39c42fee0"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_34c87782de317e88ef117a20dc0"`);
        await queryRunner.query(`CREATE TABLE "pro_categories" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_699b593fd496c84917c65e697e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "socials" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_5e3ee018e1b66c619ae3d3b3309" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "profiles_socials" ("profile_id" integer NOT NULL, "social_id" integer NOT NULL, "value" character varying NOT NULL, CONSTRAINT "PK_affcf62e4ee37ec5698783a1746" PRIMARY KEY ("profile_id", "social_id"))`);
        await queryRunner.query(`CREATE TABLE "profiles" ("id" SERIAL NOT NULL, "price" character varying NOT NULL, "conditions" character varying NOT NULL, "equipment" character varying NOT NULL, "geography" text array NOT NULL, "languages" text array NOT NULL, "about" character varying NOT NULL, "user_id" integer, CONSTRAINT "REL_9e432b7df0d182f8d292902d1a" UNIQUE ("user_id"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pro_categories_specializations" ("specialization_id" integer NOT NULL, "pro_category_id" integer NOT NULL, CONSTRAINT "PK_04190687d974a83b20ed34da175" PRIMARY KEY ("specialization_id", "pro_category_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3e176d326c68b89c900524cc7f" ON "pro_categories_specializations" ("specialization_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_08641ddc6dd642e720ffa899e7" ON "pro_categories_specializations" ("pro_category_id") `);
        await queryRunner.query(`CREATE TABLE "specializations_profiles" ("specialization_id" integer NOT NULL, "profile_id" integer NOT NULL, CONSTRAINT "PK_541c0d51b5fddf1c3b41dbde83b" PRIMARY KEY ("specialization_id", "profile_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3e004f4e54f12a49fe5fe83db9" ON "specializations_profiles" ("specialization_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_058fad78d68c2f45c962c52fab" ON "specializations_profiles" ("profile_id") `);
        await queryRunner.query(`CREATE TABLE "pro_categories_profiles" ("pro_category_id" integer NOT NULL, "profile_id" integer NOT NULL, CONSTRAINT "PK_2d2355c031df8f111a84d47d6b4" PRIMARY KEY ("pro_category_id", "profile_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cbeda55ab5d2e355d640e3f49a" ON "pro_categories_profiles" ("pro_category_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_37d70c6d07e7ae61a46d33b20c" ON "pro_categories_profiles" ("profile_id") `);
        await queryRunner.query(`ALTER TABLE "specializations" DROP COLUMN "parent_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "specialization_id"`);
        await queryRunner.query(`ALTER TABLE "profiles_socials" ADD CONSTRAINT "FK_d577ea9c2bb7eb73e34cf074683" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles_socials" ADD CONSTRAINT "FK_4b14324063b47be836e09200313" FOREIGN KEY ("social_id") REFERENCES "socials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
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
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2"`);
        await queryRunner.query(`ALTER TABLE "profiles_socials" DROP CONSTRAINT "FK_4b14324063b47be836e09200313"`);
        await queryRunner.query(`ALTER TABLE "profiles_socials" DROP CONSTRAINT "FK_d577ea9c2bb7eb73e34cf074683"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "specialization_id" integer`);
        await queryRunner.query(`ALTER TABLE "specializations" ADD "parent_id" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_37d70c6d07e7ae61a46d33b20c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cbeda55ab5d2e355d640e3f49a"`);
        await queryRunner.query(`DROP TABLE "pro_categories_profiles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_058fad78d68c2f45c962c52fab"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3e004f4e54f12a49fe5fe83db9"`);
        await queryRunner.query(`DROP TABLE "specializations_profiles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_08641ddc6dd642e720ffa899e7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3e176d326c68b89c900524cc7f"`);
        await queryRunner.query(`DROP TABLE "pro_categories_specializations"`);
        await queryRunner.query(`DROP TABLE "profiles"`);
        await queryRunner.query(`DROP TABLE "profiles_socials"`);
        await queryRunner.query(`DROP TABLE "socials"`);
        await queryRunner.query(`DROP TABLE "pro_categories"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_34c87782de317e88ef117a20dc0" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "specializations" ADD CONSTRAINT "FK_2d60d0ed0872f9085b39c42fee0" FOREIGN KEY ("parent_id") REFERENCES "specializations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
