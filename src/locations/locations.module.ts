import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Location } from './entities/location.entity';
import { Place } from './entities/place.entity';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

@Module({
    imports: [TypeOrmModule.forFeature([Location, Place])],
    providers: [LocationsService],
    exports: [LocationsService],
    controllers: [LocationsController]
})
export class LocationsModule {}
