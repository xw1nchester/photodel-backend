import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, EntityManager, In, Repository } from 'typeorm';

import { Favorite } from '@favorites/favorite.entity';
import { FilesService } from '@files/files.service';
import { Like } from '@likes/like.entity';
import { Location } from '@locations/entities/location.entity';
import { LocationsService } from '@locations/locations.service';
import { Review } from '@reviews/review.entity';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginationDto } from '@shared/dto/pagination.dto';
import { EntityType } from '@shared/enums/entity-type.enums';
import { SortOption } from '@shared/enums/sort-option.enum';
import { SpecializationsService } from '@specializations/specializations.service';

import { FilmingLocationRequestDto } from './dto/filming-location-request.dto';
import { FilmingLocation } from './filming-location.entity';

@Injectable()
export class FilmingLocationsService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(FilmingLocation)
        private readonly filmingLocationsRepository: Repository<FilmingLocation>,
        private readonly filesService: FilesService,
        private readonly locationsService: LocationsService,
        private readonly specializationsService: SpecializationsService
    ) {}

    createDto(filmingLocation: FilmingLocation) {
        const photos = filmingLocation.files.map(f =>
            this.filesService.createBasicDto(f)
        );

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
            },
            likes: {
                isLiked: filmingLocation.isLiked,
                likeId: filmingLocation.likeId,
                count: filmingLocation.likesCount
            },
            reviews: {
                count: filmingLocation.reviewsCount
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
            : this.filmingLocationsRepository;

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
                    .andWhere('favorite.entityType = :favoriteEntityType');
            }, 'favoritesCount')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Like, 'like')
                    .where('like.entityId = filmingLocation.id')
                    .andWhere('like.entityType = :likeEntityType');
            }, 'likes_count')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Review, 'review')
                    .where('review.entityId = filmingLocation.id')
                    .andWhere('review.entityType = :reviewEntityType')
                    .andWhere('review.isPublished = :reviewIsPublished');
            }, 'reviewsCount')
            .setParameter('favoriteEntityType', EntityType.PLACE)
            .setParameter('likeEntityType', EntityType.PLACE)
            .setParameter('reviewEntityType', EntityType.PLACE)
            .setParameter('reviewIsPublished', true);

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
                        .andWhere('favorite.entityType = :favoriteEntityType')
                        .andWhere('favorite.userId = :requesterUserId');
                }, 'favoriteId')
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Like, 'like')
                        .where('like.entityId = filmingLocation.id')
                        .andWhere('like.entityType = :likeEntityType')
                        .andWhere('like.userId = :requesterUserId');
                }, 'likeId')
                .setParameter('requesterUserId', requesterUserId);
        } else {
            query.andWhere('filmingLocation.isPublished = :isPublished', {
                isPublished: true
            });
        }

        const { entities, raw } = await query.getRawAndEntities();

        const filmingLocation = this.transformRawData(entities, raw)[0];

        if (!filmingLocation) {
            throw new NotFoundException('Место для съемок не найдено');
        }

        return { filmingLocation: this.createDto(filmingLocation) };
    }

    async create(userId: number, dto: FilmingLocationRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(FilmingLocation);

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

            const createdFilmingLocation = await repo.save({
                previewFileId: dto.photoIds[0],
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

    private transformRawData(entities: FilmingLocation[], raw: any[]) {
        return entities.map((fl, index) => {
            fl.isFavorite = !!raw[index].favoriteId;
            fl.favoriteId = raw[index].favoriteId;
            fl.favoritesCount = Number(raw[index].favoritesCount);

            fl.isLiked = !!raw[index].likeId;
            fl.likeId = raw[index].likeId;
            fl.likesCount = Number(raw[index].likes_count);

            fl.reviewsCount = Number(raw[index].reviewsCount);

            return fl;
        });
    }

    createBasicDto(filmingLocation: FilmingLocation) {
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
            preview: this.filesService.createBasicDto(
                filmingLocation.previewFile
            ),
            name: filmingLocation.name,
            location: this.locationsService.getDto(filmingLocation.location),
            user,
            favorites: {
                isFavorite: filmingLocation.isFavorite,
                favoriteId: filmingLocation.favoriteId,
                count: filmingLocation.favoritesCount
            },
            likes: {
                isLiked: filmingLocation.isLiked,
                likeId: filmingLocation.likeId,
                count: filmingLocation.likesCount
            },
            reviews: {
                count: filmingLocation.reviewsCount
            }
        };
    }

    async findAll({
        pagination,
        sort,
        requesterUserId,
        targetUserId,
        my
    }: {
        pagination: PaginationQueryDto;
        sort: SortOption;
        requesterUserId?: number;
        targetUserId?: number;
        my?: boolean;
    }) {
        const { page, limit } = pagination;

        const query = this.filmingLocationsRepository
            .createQueryBuilder('filmingLocation')
            .leftJoinAndSelect('filmingLocation.previewFile', 'previewFile')
            .leftJoinAndSelect('filmingLocation.location', 'location')
            .leftJoinAndSelect('location.place', 'locationPlace')
            .leftJoinAndSelect('filmingLocation.user', 'user')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = filmingLocation.id')
                    .andWhere('favorite.entityType = :favoriteEntityType');
            }, 'favoritesCount')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Like, 'like')
                    .where('like.entityId = filmingLocation.id')
                    .andWhere('like.entityType = :likeEntityType');
            }, 'likes_count')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Review, 'review')
                    .where('review.entityId = filmingLocation.id')
                    .andWhere('review.entityType = :reviewEntityType')
                    .andWhere('review.isPublished = :reviewIsPublished');
            }, 'reviewsCount')
            .setParameter('favoriteEntityType', EntityType.PLACE)
            .setParameter('likeEntityType', EntityType.PLACE)
            .setParameter('reviewEntityType', EntityType.PLACE)
            .setParameter('reviewIsPublished', true)
            .take(limit)
            .skip((page - 1) * limit);

        switch (sort) {
            case SortOption.NEWEST:
                query.orderBy('filmingLocation.createdAt', 'DESC');
                break;

            case SortOption.POPULARITY:
                query.orderBy(`likes_count`, 'DESC');
                break;

            // SortOption.DISTANCE

            default:
                query.orderBy('filmingLocation.createdAt', 'DESC');
                break;
        }

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
                        .andWhere('favorite.entityType = :favoriteEntityType')
                        .andWhere('favorite.userId = :requesterUserId');
                }, 'favoriteId')
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Like, 'like')
                        .where('like.entityId = filmingLocation.id')
                        .andWhere('like.entityType = :likeEntityType')
                        .andWhere('like.userId = :requesterUserId');
                }, 'likeId')
                .setParameter('requesterUserId', requesterUserId);
        } else {
            query.andWhere('filmingLocation.isPublished = :isPublished', {
                isPublished: true
            });
        }

        if (my && requesterUserId != undefined) {
            query.andWhere('filmingLocation.userId = :requesterUserId', {
                requesterUserId
            });
        }

        if (targetUserId != undefined) {
            query.andWhere('filmingLocation.userId = :targetUserId', {
                targetUserId
            });
        }

        const { entities, raw } = await query.getRawAndEntities();

        const total = await query.getCount();

        const filmingLocations = this.transformRawData(entities, raw);

        const dtos = filmingLocations.map(fl => this.createBasicDto(fl));

        return new PaginationDto(dtos, total, page, limit);
    }

    async findByIdAndUserId(
        id: number,
        userId: number,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(FilmingLocation)
            : this.filmingLocationsRepository;

        const filmingLocation = await repo.findOne({
            where: { id, userId },
            relations: {
                files: true,
                location: true,
                specializations: true,
                user: true
            }
        });

        if (!filmingLocation) {
            throw new NotFoundException('Место для съемок не найдено');
        }

        return filmingLocation;
    }

    async update(id: number, userId: number, dto: FilmingLocationRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(FilmingLocation);

            const filmingLocation = await this.findByIdAndUserId(
                id,
                userId,
                manager
            );

            filmingLocation.files =
                await this.filesService.findAndvalidateByIdsAndUserId(
                    dto.photoIds,
                    userId,
                    manager
                );

            filmingLocation.specializations =
                await this.specializationsService.findAndValidateByIds(
                    dto.specializationIds,
                    manager
                );

            filmingLocation.previewFileId = dto.photoIds[0];
            filmingLocation.name = dto.name;
            filmingLocation.description = dto.description;
            filmingLocation.camera = dto.camera;
            filmingLocation.price = dto.price;
            filmingLocation.conditions = dto.conditions;
            filmingLocation.isPublished = dto.isPublished;

            if (dto.location) {
                const createdLocation = await this.locationsService.create(
                    dto.location
                );
                if (filmingLocation.location) {
                    filmingLocation.location.coordinates =
                        createdLocation.coordinates;
                    filmingLocation.location.place = createdLocation.place;
                    filmingLocation.location.address = dto.location.address;
                } else {
                    filmingLocation.location = createdLocation;
                }
            } else {
                if (filmingLocation.location) {
                    await this.locationsService.deleteByIds(
                        filmingLocation.location.id,
                        manager
                    );
                }
                filmingLocation.location = null;
            }

            await repo.save(filmingLocation);

            return await this.getDtoById({
                id,
                requesterUserId: userId,
                manager
            });
        });
    }

    async remove(id: number, userId: number) {
        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(FilmingLocation);

            const filmingLocation = await this.findByIdAndUserId(
                id,
                userId,
                manager
            );

            await repo.remove(filmingLocation);

            return { filmingLocation: this.createDto(filmingLocation) };
        });
    }

    async validateByIdsAndUserId(
        ids: number[],
        userId: number,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(FilmingLocation)
            : this.filmingLocationsRepository;

        ids = [...new Set(ids)];

        const filmingLocations = await repo.find({
            where: { id: In(ids), userId }
        });

        if (ids.length != filmingLocations.length) {
            throw new NotFoundException('Место для съемок не найдено');
        }
    }

    async bulkRemove(userId: number, ids: number[]) {
        await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(FilmingLocation);

            await this.validateByIdsAndUserId(ids, userId, manager);

            await repo.delete({
                id: In(ids)
            });
        });
    }

    async findByIds(
        ids: number[],
        requesterUserId: number,
        manager?: EntityManager
    ) {
        if (ids.length == 0) return [];

        const repo = manager
            ? manager.getRepository(FilmingLocation)
            : this.filmingLocationsRepository;

        const query = repo
            .createQueryBuilder('filmingLocation')
            .where('filmingLocation.id IN (:...ids)', { ids })
            .leftJoinAndSelect('filmingLocation.previewFile', 'previewFile')
            .leftJoinAndSelect('filmingLocation.location', 'location')
            .leftJoinAndSelect('location.place', 'locationPlace')
            .leftJoinAndSelect('filmingLocation.user', 'user')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = filmingLocation.id')
                    .andWhere('favorite.entityType = :favoriteEntityType');
            }, 'favoritesCount')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Like, 'like')
                    .where('like.entityId = filmingLocation.id')
                    .andWhere('like.entityType = :likeEntityType');
            }, 'likes_count')
            .addSelect(subQuery => {
                return subQuery
                    .select('id')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = filmingLocation.id')
                    .andWhere('favorite.entityType = :favoriteEntityType')
                    .andWhere('favorite.userId = :requesterUserId');
            }, 'favoriteId')
            .addSelect(subQuery => {
                return subQuery
                    .select('id')
                    .from(Like, 'like')
                    .where('like.entityId = filmingLocation.id')
                    .andWhere('like.entityType = :likeEntityType')
                    .andWhere('like.userId = :requesterUserId');
            }, 'likeId')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Review, 'review')
                    .where('review.entityId = filmingLocation.id')
                    .andWhere('review.entityType = :reviewEntityType')
                    .andWhere('review.isPublished = :reviewIsPublished');
            }, 'reviewsCount')
            .setParameter('favoriteEntityType', EntityType.PLACE)
            .setParameter('likeEntityType', EntityType.PLACE)
            .setParameter('reviewEntityType', EntityType.PLACE)
            .setParameter('reviewIsPublished', true)
            .setParameter('requesterUserId', requesterUserId);

        const { entities, raw } = await query.getRawAndEntities();

        const filmingLocations = this.transformRawData(entities, raw);

        return filmingLocations.map(fl => this.createBasicDto(fl));
    }

    async exists(id: number) {
        const count = await this.filmingLocationsRepository.count({
            where: { id }
        });
        return count > 0;
    }
}
