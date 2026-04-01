import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilmingLocationsModule } from '@filming-locations/filming-locations.module';
import { PhotosModule } from '@photos/photos.module';
import { UsersModule } from '@users/users.module';

import { Review } from './review.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Review]),
        UsersModule,
        PhotosModule,
        FilmingLocationsModule
    ],
    controllers: [ReviewsController],
    providers: [ReviewsService]
})
export class ReviewsModule {}
