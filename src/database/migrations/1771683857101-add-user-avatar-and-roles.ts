import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAvatarAndRoles1771683857101 implements MigrationInterface {
    name = 'AddUserAvatarAndRoles1771683857101';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "roles" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "users_roles" ("user_id" integer NOT NULL, "role_id" integer NOT NULL, CONSTRAINT "PK_c525e9373d63035b9919e578a9c" PRIMARY KEY ("user_id", "role_id"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_e4435209df12bc1f001e536017" ON "users_roles" ("user_id") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_1cf664021f00b9cc1ff95e17de" ON "users_roles" ("role_id") `
        );
        await queryRunner.query(
            `ALTER TABLE "users" ADD "avatar" character varying`
        );
        await queryRunner.query(
            `ALTER TABLE "users_roles" ADD CONSTRAINT "FK_e4435209df12bc1f001e5360174" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "users_roles" ADD CONSTRAINT "FK_1cf664021f00b9cc1ff95e17de4" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users_roles" DROP CONSTRAINT "FK_1cf664021f00b9cc1ff95e17de4"`
        );
        await queryRunner.query(
            `ALTER TABLE "users_roles" DROP CONSTRAINT "FK_e4435209df12bc1f001e5360174"`
        );
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
        await queryRunner.query(
            `DROP INDEX "public"."IDX_1cf664021f00b9cc1ff95e17de"`
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_e4435209df12bc1f001e536017"`
        );
        await queryRunner.query(`DROP TABLE "users_roles"`);
        await queryRunner.query(`DROP TABLE "roles"`);
    }
}
