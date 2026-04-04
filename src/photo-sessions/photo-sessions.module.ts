import { Module } from '@nestjs/common';
import { PhotoSessionsService } from './photo-sessions.service';
import { PhotoSessionsController } from './photo-sessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoSession } from './photo-session.entity';
import { LocationsModule } from '@locations/locations.module';
import { UsersModule } from '@users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PhotoSession]),
        LocationsModule,
        UsersModule
    ],
    controllers: [PhotoSessionsController],
    providers: [PhotoSessionsService]
})
export class PhotoSessionsModule {}
