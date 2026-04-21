import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilmingLocationsModule } from '@filming-locations/filming-locations.module';
import { PhotoSessionsModule } from '@photo-sessions/photo-sessions.module';
import { PhotosModule } from '@photos/photos.module';
import { TrainingsModule } from '@trainings/trainings.module';
import { UsersModule } from '@users/users.module';

import { Review } from './review.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Review]),
        UsersModule,
        PhotosModule,
        FilmingLocationsModule,
        PhotoSessionsModule,
        TrainingsModule
    ],
    controllers: [ReviewsController],
    providers: [ReviewsService]
})
export class ReviewsModule {}
