import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlbumModule } from '@album/album.module';
import { SpecializationsModule } from '@specializations/specializations.module';

import { PhotoController } from './photo.controller';
import { Photo } from './photo.entity';
import { PhotoService } from './photo.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Photo]),
        SpecializationsModule,
        AlbumModule
    ],
    controllers: [PhotoController],
    providers: [PhotoService]
})
export class PhotoModule {}
