import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Point, Repository } from 'typeorm';

import { CreateLocationDto } from './dto/create-location.dto';
import { Location } from './entities/location.entity';
import { Place } from './entities/place.entity';

@Injectable()
export class LocationsService {
    constructor(
        @InjectRepository(Location)
        private readonly locationsRepository: Repository<Location>,
        @InjectRepository(Place)
        private readonly placesRepository: Repository<Place>
    ) {}

    private getPlaceDto(place: Place) {
        return place
            ? {
                  id: place.id,
                //   latitude: place.coordinates.coordinates[1],
                //   longitude: place.coordinates.coordinates[0],
                  country: place.country,
                  city: place.city
              }
            : null;
    }

    getDto(location: Location) {
        return location
            ? {
                  id: location.id,
                  latitude: location.coordinates.coordinates[1],
                  longitude: location.coordinates.coordinates[0],
                  place: this.getPlaceDto(location.place),
                  address: location.address
              }
            : null;
    }

    async create(dto: CreateLocationDto) {
        const coordinates: Point = {
            type: 'Point',
            coordinates: [dto.longitude, dto.latitude]
        };

        const nearestPlace = await this.placesRepository
            .createQueryBuilder('place')
            .orderBy(
                'place.coordinates <-> ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)',
                'ASC'
            )
            .setParameters({ lat: dto.latitude, lon: dto.longitude })
            .getOne();

        return this.locationsRepository.create({
            coordinates,
            address: dto.address,
            place: nearestPlace
        });
    }

    async deleteByIds(ids: number[], manager?: EntityManager) {
        if (ids.length == 0) return;

        const repo = manager
            ? manager.getRepository(Location)
            : this.locationsRepository;

        await repo.delete(ids);
    }
}
