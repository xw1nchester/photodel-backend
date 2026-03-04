import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Point, Repository } from 'typeorm';

import { CreateLocationDto } from './dto/create-location.dto';
import { Location } from './location.entity';

@Injectable()
export class LocationsService {
    constructor(
        @InjectRepository(Location)
        private readonly locationsRepository: Repository<Location>
    ) {}

    getDto(location: Location) {
        return location
            ? {
                  id: location.id,
                  latitude: location.coordinates.coordinates[1],
                  longitude: location.coordinates.coordinates[0],
                  country: location.country,
                  city: location.city,
                  street: location.street,
                  houseNumber: location.houseNumber
              }
            : null;
    }

    create(dto: CreateLocationDto) {
        const coordinates: Point = {
            type: 'Point',
            coordinates: [dto.longitude, dto.latitude]
        };

        return this.locationsRepository.create({
            coordinates,
            country: dto.country,
            city: dto.city,
            street: dto.street,
            houseNumber: dto.houseNumber
        });
    }

    async deleteByIds(ids: number[], manager?: EntityManager) {
        if (ids.length == 0) return;

        console.log(`Удаление локаций с id: ${ids}`);

        const repo = manager
            ? manager.getRepository(Location)
            : this.locationsRepository;

        await repo.delete(ids);
    }
}
