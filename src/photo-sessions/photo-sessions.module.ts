import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LocationsModule } from '@locations/locations.module';
import { TeamsModule } from '@teams/teams.module';

import { PhotoSession } from './photo-session.entity';
import { PhotoSessionsController } from './photo-sessions.controller';
import { PhotoSessionsService } from './photo-sessions.service';
import { SpecializationsModule } from '@specializations/specializations.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PhotoSession]),
        LocationsModule,
        TeamsModule,
        SpecializationsModule
    ],
    controllers: [PhotoSessionsController],
    providers: [PhotoSessionsService],
    exports: [PhotoSessionsService]
})
export class PhotoSessionsModule {}
