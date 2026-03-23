import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlbumsModule } from '@albums/albums.module';
import { FilmingLocationsModule } from '@filming-locations/filming-locations.module';
import { PhotosModule } from '@photos/photos.module';
import { UsersModule } from '@users/users.module';

import { Favorite } from './favorite.entity';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Favorite]),
        UsersModule,
        AlbumsModule,
        PhotosModule,
        FilmingLocationsModule
    ],
    controllers: [FavoritesController],
    providers: [FavoritesService]
})
export class FavoritesModule {}
