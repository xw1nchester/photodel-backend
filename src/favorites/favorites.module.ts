import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilmingLocationsModule } from '@filming-locations/filming-locations.module';
import { PhotoSessionsModule } from '@photo-sessions/photo-sessions.module';
import { PhotosModule } from '@photos/photos.module';
import { TrainingsModule } from '@trainings/trainings.module';
import { UsersModule } from '@users/users.module';

import { Favorite } from './favorite.entity';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Favorite]),
        UsersModule,
        PhotosModule,
        FilmingLocationsModule,
        PhotoSessionsModule,
        TrainingsModule
    ],
    controllers: [FavoritesController],
    providers: [FavoritesService]
})
export class FavoritesModule {}
