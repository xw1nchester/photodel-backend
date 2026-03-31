import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeDeleteTriggers1774938362864 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // PHOTO
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION delete_photo_relations()
            RETURNS TRIGGER AS $$
            BEGIN
                DELETE FROM likes
                WHERE entity_type = 'photo'
                AND entity_id = OLD.id;

                DELETE FROM favorites
                WHERE entity_type = 'photo'
                AND entity_id = OLD.id;

                RETURN OLD;
            END;
            $$ LANGUAGE plpgsql;
        `);

        await queryRunner.query(`
            CREATE TRIGGER trg_delete_photo_relations
            BEFORE DELETE ON photos
            FOR EACH ROW
            EXECUTE FUNCTION delete_photo_relations();
        `);

        // USER
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION delete_user_relations()
            RETURNS TRIGGER AS $$
            BEGIN
                DELETE FROM likes
                WHERE entity_type = 'user'
                AND entity_id = OLD.id;

                DELETE FROM favorites
                WHERE entity_type = 'user'
                AND entity_id = OLD.id;

                RETURN OLD;
            END;
            $$ LANGUAGE plpgsql;
        `);

        await queryRunner.query(`
            CREATE TRIGGER trg_delete_user_relations
            BEFORE DELETE ON users
            FOR EACH ROW
            EXECUTE FUNCTION delete_user_relations();
        `);

        // PLACE / filming_locations
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION delete_place_relations()
            RETURNS TRIGGER AS $$
            BEGIN
                DELETE FROM likes
                WHERE entity_type = 'place'
                AND entity_id = OLD.id;

                DELETE FROM favorites
                WHERE entity_type = 'place'
                AND entity_id = OLD.id;

                RETURN OLD;
            END;
            $$ LANGUAGE plpgsql;
        `);

        await queryRunner.query(`
            CREATE TRIGGER trg_delete_place_relations
            BEFORE DELETE ON filming_locations
            FOR EACH ROW
            EXECUTE FUNCTION delete_place_relations();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS trg_delete_photo_relations ON photos;
        `);

        await queryRunner.query(`
            DROP FUNCTION IF EXISTS delete_photo_relations;
        `);

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS trg_delete_user_relations ON users;
        `);

        await queryRunner.query(`
            DROP FUNCTION IF EXISTS delete_user_relations;
        `);

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS trg_delete_place_relations ON filming_locations;
        `);

        await queryRunner.query(`
            DROP FUNCTION IF EXISTS delete_place_relations;
        `);
    }
}
