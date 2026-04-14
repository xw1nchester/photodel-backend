import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, ILike, Point, Repository } from 'typeorm';

import { PaginationDto } from '@shared/dto/pagination.dto';

import { CreateLocationDto } from './dto/create-location.dto';
import { PlaceQueryDto } from './dto/place-query.dto';
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
                  latitude: place.coordinates.coordinates[1],
                  longitude: place.coordinates.coordinates[0],
                  country: place.country,
                  city: place.city
              }
            : null;
    }

    createDto(location: Location) {
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

    async create(dto: CreateLocationDto, manager?: EntityManager) {
        const locationsRepo = manager
            ? manager.getRepository(Location)
            : this.locationsRepository;
            
        const placesRepo = manager
            ? manager.getRepository(Place)
            : this.placesRepository;

        const coordinates: Point = {
            type: 'Point',
            coordinates: [dto.longitude, dto.latitude]
        };

        const nearestPlace = await placesRepo
            .createQueryBuilder('place')
            .orderBy(
                'place.coordinates <-> ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)',
                'ASC'
            )
            .setParameters({ lat: dto.latitude, lon: dto.longitude })
            .getOne();

        return locationsRepo.create({
            coordinates,
            address: dto.address,
            place: nearestPlace
        });
    }

    async deleteByIds(ids: number | number[], manager?: EntityManager) {
        const idsArray = Array.isArray(ids) ? ids : [ids];

        if (idsArray.length === 0) return;

        const repo = manager
            ? manager.getRepository(Location)
            : this.locationsRepository;

        await repo.delete(idsArray);
    }

    async findPlaces({ page, limit, search }: PlaceQueryDto) {
        let where = {};

        if (search) {
            where = {
                city: ILike(`%${search}%`)
            };
        }

        const [enitities, count] = await this.placesRepository.findAndCount({
            where,
            take: limit,
            skip: (page - 1) * limit
        });

        const places = enitities.map(e => this.getPlaceDto(e));

        return new PaginationDto(places, count, page, limit);
    }
}
