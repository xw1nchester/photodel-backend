import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, EntityManager, Repository } from 'typeorm';

import { FavoriteEntityType } from '@favorites/enums';
import { Favorite } from '@favorites/favorite.entity';
import { FilesService } from '@files/files.service';
import { Location } from '@locations/entities/location.entity';
import { LocationsService } from '@locations/locations.service';
import { SpecializationsService } from '@specializations/specializations.service';

import { FilmingLocationRequestDto } from './dto/filming-location-request.dto';
import { FilmingLocation } from './filming-location.entity';

@Injectable()
export class FilmingLocationsService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(FilmingLocation)
        private readonly filmingLocationRepository: Repository<FilmingLocation>,
        private readonly filesService: FilesService,
        private readonly locationsService: LocationsService,
        private readonly specializationsService: SpecializationsService
    ) {}

    createDto(filmingLocation: FilmingLocation) {
        const photos = filmingLocation.files.map(f => ({
            id: f.id,
            key: f.key,
            // TODO: опеределиться, использовать метод filesService или s3 в таких случаях
            url: this.filesService.getUrl(f.key)
        }));

        const user = {
            id: filmingLocation.user.id,
            firstName: filmingLocation.user.firstName,
            lastName: filmingLocation.user.lastName,
            avatarKey: filmingLocation.user.avatarKey,
            avatarUrl: filmingLocation.user.avatarKey
                ? this.filesService.getUrl(filmingLocation.user.avatarKey)
                : null,
            isPro: filmingLocation.user.isPro
        };

        return {
            id: filmingLocation.id,
            photos,
            name: filmingLocation.name,
            description: filmingLocation.description,
            location: this.locationsService.getDto(filmingLocation.location),
            camera: filmingLocation.camera,
            price: filmingLocation.price,
            conditions: filmingLocation.conditions,
            isPublished: filmingLocation.isPublished,
            specializations: filmingLocation.specializations,
            createdAt: filmingLocation.createdAt,
            updatedAt: filmingLocation.updatedAt,
            user,
            favorites: {
                isFavorite: filmingLocation.isFavorite,
                favoriteId: filmingLocation.favoriteId,
                count: filmingLocation.favoritesCount
            }
        };
    }

    async getDtoById({
        id,
        requesterUserId,
        manager
    }: {
        id: number;
        requesterUserId: number;
        manager?: EntityManager;
    }) {
        const repo = manager
            ? manager.getRepository(FilmingLocation)
            : this.filmingLocationRepository;

        const query = repo
            .createQueryBuilder('filmingLocation')
            .where('filmingLocation.id = :id', { id })
            .leftJoinAndSelect('filmingLocation.files', 'files')
            .leftJoinAndSelect('filmingLocation.location', 'location')
            .leftJoinAndSelect('location.place', 'locationPlace')
            .leftJoinAndSelect(
                'filmingLocation.specializations',
                'specializations'
            )
            .leftJoinAndSelect('filmingLocation.user', 'user')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = filmingLocation.id')
                    .andWhere('favorite.entityType = :entityType');
            }, 'favoritesCount')
            .setParameter('entityType', FavoriteEntityType.PLACE);

        if (requesterUserId != undefined) {
            query
                .andWhere(
                    new Brackets(qb => {
                        qb.where('filmingLocation.userId = :requesterUserId', {
                            requesterUserId
                        }).orWhere(
                            'filmingLocation.isPublished = :isPublished',
                            {
                                isPublished: true
                            }
                        );
                    })
                )
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Favorite, 'favorite')
                        .where('favorite.entityId = filmingLocation.id')
                        .andWhere('favorite.entityType = :entityType')
                        .andWhere('favorite.userId = :requesterUserId');
                }, 'favoriteId')
                .setParameter('requesterUserId', requesterUserId);
        } else {
            query.andWhere('filmingLocation.isPublished = :isPublished', {
                isPublished: true
            });
        }

        const result = await query.getRawAndEntities();

        const filmingLocation = result.entities[0];

        if (!filmingLocation) {
            throw new NotFoundException('Место для съемок не найдена');
        }

        filmingLocation.isFavorite = !!result.raw[0].favoriteId;
        filmingLocation.favoriteId = result.raw[0].favoriteId;
        filmingLocation.favoritesCount = Number(result.raw[0].favoritesCount);

        return { filmingLocation: this.createDto(filmingLocation) };
    }

    async create(userId: number, dto: FilmingLocationRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const files = await this.filesService.findAndvalidateByIdsAndUserId(
                dto.photoIds,
                userId,
                manager
            );

            let location: Location | null = null;
            if (dto.location) {
                location = await this.locationsService.create(dto.location);
            }

            const specializations =
                await this.specializationsService.findAndValidateByIds(
                    dto.specializationIds,
                    manager
                );

            const createdFilmingLocation =
                await this.filmingLocationRepository.save({
                    name: dto.name,
                    description: dto.description,
                    camera: dto.camera,
                    price: dto.price,
                    conditions: dto.conditions,
                    isPublished: dto.isPublished,
                    files,
                    location,
                    specializations,
                    userId
                });

            return await this.getDtoById({
                id: createdFilmingLocation.id,
                requesterUserId: userId,
                manager
            });
        });
    }
}
