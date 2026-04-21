import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesModule } from '@files/files.module';
import { LocationsModule } from '@locations/locations.module';
import { TeamsModule } from '@teams/teams.module';
import { UsersModule } from '@users/users.module';

import { Training } from './training.entity';
import { TrainingsController } from './trainings.controller';
import { TrainingsService } from './trainings.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Training]),
        UsersModule,
        FilesModule,
        LocationsModule,
        TeamsModule
    ],
    controllers: [TrainingsController],
    providers: [TrainingsService],
    exports: [TrainingsService]
})
export class TrainingsModule {}
