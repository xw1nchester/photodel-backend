import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LocationsModule } from '@locations/locations.module';
import { UsersModule } from '@users/users.module';

import { PhotoSession } from './photo-session.entity';
import { PhotoSessionsController } from './photo-sessions.controller';
import { PhotoSessionsService } from './photo-sessions.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([PhotoSession]),
        LocationsModule,
        UsersModule
    ],
    controllers: [PhotoSessionsController],
    providers: [PhotoSessionsService],
    exports: [PhotoSessionsService]
})
export class PhotoSessionsModule {}
