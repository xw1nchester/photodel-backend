import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Location } from './entities/location.entity';
import { LocationsService } from './locations.service';
import { Place } from './entities/place.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Location, Place])],
    providers: [LocationsService],
    exports: [LocationsService]
})
export class LocationsModule {}
