import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlbumsModule } from '@albums/albums.module';
import { LocationsModule } from '@locations/locations.module';
import { SpecializationsModule } from '@specializations/specializations.module';

import { Photo } from './photo.entity';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Photo]),
        SpecializationsModule,
        forwardRef(() => AlbumsModule),
        LocationsModule
    ],
    controllers: [PhotosController],
    providers: [PhotosService],
    exports: [PhotosService]
})
export class PhotosModule {}
