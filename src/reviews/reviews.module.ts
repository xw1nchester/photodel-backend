import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { UsersModule } from '@users/users.module';
import { PhotosModule } from '@photos/photos.module';
import { FilmingLocationsModule } from '@filming-locations/filming-locations.module';

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
