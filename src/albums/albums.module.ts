import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlbumsController } from './albums.controller';
import { Album } from './album.entity';
import { AlbumsService } from './albums.service';

@Module({
    imports: [TypeOrmModule.forFeature([Album])],
    controllers: [AlbumsController],
    providers: [AlbumsService],
    exports: [AlbumsService]
})
export class AlbumsModule {}
