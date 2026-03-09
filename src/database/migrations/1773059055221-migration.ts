import { MigrationInterface, QueryRunner } from 'typeorm';

export class PhotoAlbumsCascadeDelete1773059055221 implements MigrationInterface {
    name = 'PhotoAlbumsCascadeDelete1773059055221';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "photos_albums" DROP CONSTRAINT "FK_55f6d9def8277877d5dab4b21d6"`
        );
        await queryRunner.query(
            `ALTER TABLE "photos_albums" ADD CONSTRAINT "FK_55f6d9def8277877d5dab4b21d6" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "photos_albums" DROP CONSTRAINT "FK_55f6d9def8277877d5dab4b21d6"`
        );
        await queryRunner.query(
            `ALTER TABLE "photos_albums" ADD CONSTRAINT "FK_55f6d9def8277877d5dab4b21d6" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }
}
