import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilmingLocationsModule } from '@filming-locations/filming-locations.module';
import { PhotoSessionsModule } from '@photo-sessions/photo-sessions.module';
import { PhotosModule } from '@photos/photos.module';
import { UsersModule } from '@users/users.module';

import { Like } from './like.entity';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Like]),
        UsersModule,
        PhotosModule,
        FilmingLocationsModule,
        PhotoSessionsModule
    ],
    controllers: [LikesController],
    providers: [LikesService]
})
export class LikesModule {}
