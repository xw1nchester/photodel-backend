import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from '@auth/auth.module';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { DatabaseModule } from '@database/database.module';

import { AlbumsModule } from './albums/albums.module';
import { AppController } from './app.controller';
import { FavoritesModule } from './favorites/favorites.module';
import { FilesModule } from './files/files.module';
import { FilmingLocationsModule } from './filming-locations/filming-locations.module';
import { LikesModule } from './likes/likes.module';
import { LocationsModule } from './locations/locations.module';
import { PhotosModule } from './photos/photos.module';
import { RolesModule } from './roles/roles.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        DatabaseModule,
        AuthModule,
        RolesModule,
        FilesModule,
        LocationsModule,
        AlbumsModule,
        PhotosModule,
        FavoritesModule,
        FilmingLocationsModule,
        LikesModule
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        }
    ]
})
export class AppModule {}
