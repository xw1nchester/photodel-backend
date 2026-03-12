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
                  address: location.address
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
            address: dto.address
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
