import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlbumsModule } from '@albums/albums.module';
import { LocationsModule } from '@locations/locations.module';
import { S3Module } from '@s3/s3.module';
import { SpecializationsModule } from '@specializations/specializations.module';

import { Photo } from './photo.entity';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Photo]),
        SpecializationsModule,
        AlbumsModule,
        LocationsModule,
        S3Module
    ],
    controllers: [PhotosController],
    providers: [PhotosService],
    exports: [PhotosService]
})
export class PhotosModule {}
