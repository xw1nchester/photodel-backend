import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { S3Module } from '@s3/s3.module';

import { Album } from './album.entity';
import { AlbumsController } from './albums.controller';
import { AlbumsService } from './albums.service';

@Module({
    imports: [TypeOrmModule.forFeature([Album]), S3Module],
    controllers: [AlbumsController],
    providers: [AlbumsService],
    exports: [AlbumsService]
})
export class AlbumsModule {}
