import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SpecializationsModule } from '@specializations/specializations.module';

import { PhotosController } from './photos.controller';
import { Photo } from './photo.entity';
import { PhotosService } from './photos.service';
import { AlbumsModule } from '@albums/albums.module';
import { LocationsModule } from '@locations/locations.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Photo]),
        SpecializationsModule,
        AlbumsModule,
        LocationsModule
    ],
    controllers: [PhotosController],
    providers: [PhotosService]
})
export class PhotosModule {}
