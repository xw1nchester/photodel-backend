import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LocationsModule } from '@locations/locations.module';
import { SpecializationsModule } from '@specializations/specializations.module';

import { FilmingLocation } from './filming-location.entity';
import { FilmingLocationsController } from './filming-locations.controller';
import { FilmingLocationsService } from './filming-locations.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([FilmingLocation]),
        SpecializationsModule,
        LocationsModule
    ],
    controllers: [FilmingLocationsController],
    providers: [FilmingLocationsService]
})
export class FilmingLocationsModule {}
