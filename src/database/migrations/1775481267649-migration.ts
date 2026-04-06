import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTeamRequestsTable1775481267649 implements MigrationInterface {
    name = 'AddTeamRequestsTable1775481267649';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."team_requests_status_enum" AS ENUM('pending', 'accepted', 'rejected')`
        );
        await queryRunner.query(
            `CREATE TABLE "team_requests" ("id" SERIAL NOT NULL, "sender_user_id" integer NOT NULL, "receiver_user_id" integer NOT NULL, "status" "public"."team_requests_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_11860d906290f929c95868ee7f1" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "team_requests" ADD CONSTRAINT "FK_fd6ed660430b661c9dd0c270271" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "team_requests" ADD CONSTRAINT "FK_3c763624283754beb325f20bb53" FOREIGN KEY ("receiver_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "team_requests" DROP CONSTRAINT "FK_3c763624283754beb325f20bb53"`
        );
        await queryRunner.query(
            `ALTER TABLE "team_requests" DROP CONSTRAINT "FK_fd6ed660430b661c9dd0c270271"`
        );
        await queryRunner.query(`DROP TABLE "team_requests"`);
        await queryRunner.query(
            `DROP TYPE "public"."team_requests_status_enum"`
        );
    }
}
