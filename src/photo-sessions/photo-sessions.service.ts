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
import { UsersService } from '@users/users.service';

import { PhotoSessionRequestDto } from './dto/photo-session-request.dto';
import { PhotoSession } from './photo-session.entity';

@Injectable()
export class PhotoSessionsService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(PhotoSession)
        private readonly photoSessionsRepository: Repository<PhotoSession>,
        private readonly filesService: FilesService,
        private readonly locationsService: LocationsService,
        private readonly usersService: UsersService
    ) {}

    createDto(photoSession: PhotoSession) {
        const photos = photoSession.files.map(f =>
            this.filesService.createBasicDto(f)
        );

        const user = {
            id: photoSession.user.id,
            firstName: photoSession.user.firstName,
            lastName: photoSession.user.lastName,
            avatarKey: photoSession.user.avatarKey,
            avatarUrl: photoSession.user.avatarKey
                ? this.filesService.getUrl(photoSession.user.avatarKey)
                : null,
            isPro: photoSession.user.isPro
        };

        const team = photoSession.team.map(user => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarKey: user.avatarKey,
            avatarUrl: user.avatarKey
                ? this.filesService.getUrl(user.avatarKey)
                : null,
            isPro: user.isPro,
            proCategories: user.profile.proCategories
        }));

        return {
            id: photoSession.id,
            photos,
            name: photoSession.name,
            description: photoSession.description,
            location: this.locationsService.getDto(photoSession.location),
            startDate: photoSession.startDate,
            endDate: photoSession.endDate,
            type: photoSession.type,
            isPublished: photoSession.isPublished,
            team,
            createdAt: photoSession.createdAt,
            updatedAt: photoSession.updatedAt,
            user,
            favorites: {
                isFavorite: photoSession.isFavorite,
                favoriteId: photoSession.favoriteId,
                count: photoSession.favoritesCount
            },
            likes: {
                isLiked: photoSession.isLiked,
                likeId: photoSession.likeId,
                count: photoSession.likesCount
            },
            reviews: {
                count: photoSession.reviewsCount
            }
        };
    }

    private transformRawData(entities: PhotoSession[], raw: any[]) {
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
            ? manager.getRepository(PhotoSession)
            : this.photoSessionsRepository;

        const query = repo
            .createQueryBuilder('photoSession')
            .where('photoSession.id = :id', { id })
            .leftJoinAndSelect('photoSession.files', 'files')
            .leftJoinAndSelect('photoSession.location', 'location')
            .leftJoinAndSelect('location.place', 'locationPlace')
            .leftJoinAndSelect('photoSession.team', 'team')
            .leftJoinAndSelect('photoSession.user', 'user')
            .leftJoinAndSelect('team.profile', 'profile')
            .leftJoinAndSelect('profile.proCategories', 'proCategories')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = photoSession.id')
                    .andWhere('favorite.entityType = :favoriteEntityType');
            }, 'favoritesCount')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Like, 'like')
                    .where('like.entityId = photoSession.id')
                    .andWhere('like.entityType = :likeEntityType');
            }, 'likes_count')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Review, 'review')
                    .where('review.entityId = photoSession.id')
                    .andWhere('review.entityType = :reviewEntityType')
                    .andWhere('review.isPublished = :reviewIsPublished');
            }, 'reviewsCount')
            .setParameter('favoriteEntityType', EntityType.PHOTO_SESSION)
            .setParameter('likeEntityType', EntityType.PHOTO_SESSION)
            .setParameter('reviewEntityType', EntityType.PHOTO_SESSION)
            .setParameter('reviewIsPublished', true);

        if (requesterUserId != undefined) {
            query
                .andWhere(
                    new Brackets(qb => {
                        qb.where('photoSession.userId = :requesterUserId', {
                            requesterUserId
                        }).orWhere('photoSession.isPublished = :isPublished', {
                            isPublished: true
                        });
                    })
                )
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Favorite, 'favorite')
                        .where('favorite.entityId = photoSession.id')
                        .andWhere('favorite.entityType = :favoriteEntityType')
                        .andWhere('favorite.userId = :requesterUserId');
                }, 'favoriteId')
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Like, 'like')
                        .where('like.entityId = photoSession.id')
                        .andWhere('like.entityType = :likeEntityType')
                        .andWhere('like.userId = :requesterUserId');
                }, 'likeId')
                .setParameter('requesterUserId', requesterUserId);
        } else {
            query.andWhere('photoSession.isPublished = :isPublished', {
                isPublished: true
            });
        }

        const { entities, raw } = await query.getRawAndEntities();

        const photoSession = this.transformRawData(entities, raw)[0];

        if (!photoSession) {
            throw new NotFoundException('Фотосессия не найдена');
        }

        return { photoSession: this.createDto(photoSession) };
    }

    async create(userId: number, dto: PhotoSessionRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(PhotoSession);

            const files = await this.filesService.findAndvalidateByIdsAndUserId(
                dto.photoIds,
                userId,
                manager
            );

            if (!dto.team.includes(userId)) {
                dto.team.unshift(userId);
            }

            const team = await this.usersService.findAndValidateByIds(
                dto.team,
                manager
            );

            let location: Location | null = null;
            if (dto.location) {
                location = await this.locationsService.create(dto.location);
            }

            const createdPhotoSession = await repo.save({
                previewFileId: dto.photoIds[0],
                name: dto.name,
                description: dto.description,
                startDate: dto.startDate,
                endDate: dto.endDate,
                type: dto.type,
                isPublished: dto.isPublished,
                files,
                team,
                location,
                userId
            });

            return await this.getDtoById({
                id: createdPhotoSession.id,
                requesterUserId: userId,
                manager
            });
        });
    }

    createBasicDto(photoSession: PhotoSession) {
        return {
            id: photoSession.id,
            preview: this.filesService.createBasicDto(photoSession.previewFile),
            name: photoSession.name,
            location: this.locationsService.getDto(photoSession.location),
            favorites: {
                isFavorite: photoSession.isFavorite,
                favoriteId: photoSession.favoriteId,
                count: photoSession.favoritesCount
            },
            likes: {
                isLiked: photoSession.isLiked,
                likeId: photoSession.likeId,
                count: photoSession.likesCount
            },
            reviews: {
                count: photoSession.reviewsCount
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

        const query = this.photoSessionsRepository
            .createQueryBuilder('photoSession')
            .leftJoinAndSelect('photoSession.previewFile', 'previewFile')
            .leftJoinAndSelect('photoSession.location', 'location')
            .leftJoinAndSelect('location.place', 'locationPlace')
            .leftJoinAndSelect('photoSession.user', 'user')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = photoSession.id')
                    .andWhere('favorite.entityType = :favoriteEntityType');
            }, 'favoritesCount')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Like, 'like')
                    .where('like.entityId = photoSession.id')
                    .andWhere('like.entityType = :likeEntityType');
            }, 'likes_count')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Review, 'review')
                    .where('review.entityId = photoSession.id')
                    .andWhere('review.entityType = :reviewEntityType')
                    .andWhere('review.isPublished = :reviewIsPublished');
            }, 'reviewsCount')
            .setParameter('favoriteEntityType', EntityType.PHOTO_SESSION)
            .setParameter('likeEntityType', EntityType.PHOTO_SESSION)
            .setParameter('reviewEntityType', EntityType.PHOTO_SESSION)
            .setParameter('reviewIsPublished', true)
            .take(limit)
            .skip((page - 1) * limit);

        switch (sort) {
            case SortOption.NEWEST:
                query.orderBy('photoSession.createdAt', 'DESC');
                break;

            case SortOption.POPULARITY:
                query.orderBy(`likes_count`, 'DESC');
                break;

            // SortOption.DISTANCE

            default:
                query.orderBy('photoSession.createdAt', 'DESC');
                break;
        }

        if (requesterUserId != undefined) {
            query
                .andWhere(
                    new Brackets(qb => {
                        qb.where('photoSession.userId = :requesterUserId', {
                            requesterUserId
                        }).orWhere('photoSession.isPublished = :isPublished', {
                            isPublished: true
                        });
                    })
                )
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Favorite, 'favorite')
                        .where('favorite.entityId = photoSession.id')
                        .andWhere('favorite.entityType = :favoriteEntityType')
                        .andWhere('favorite.userId = :requesterUserId');
                }, 'favoriteId')
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Like, 'like')
                        .where('like.entityId = photoSession.id')
                        .andWhere('like.entityType = :likeEntityType')
                        .andWhere('like.userId = :requesterUserId');
                }, 'likeId')
                .setParameter('requesterUserId', requesterUserId);
        } else {
            query.andWhere('photoSession.isPublished = :isPublished', {
                isPublished: true
            });
        }

        if (my && requesterUserId != undefined) {
            query.andWhere('photoSession.userId = :requesterUserId', {
                requesterUserId
            });
        }

        if (targetUserId != undefined) {
            query.andWhere('photoSession.userId = :targetUserId', {
                targetUserId
            });
        }

        const { entities, raw } = await query.getRawAndEntities();

        const total = await query.getCount();

        const photoSessions = this.transformRawData(entities, raw);

        const dtos = photoSessions.map(fl => this.createBasicDto(fl));

        return new PaginationDto(dtos, total, page, limit);
    }

    async findByIdAndUserId(
        id: number,
        userId: number,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(PhotoSession)
            : this.photoSessionsRepository;

        const photoSession = await repo.findOne({
            where: { id, userId },
            relations: {
                files: true,
                location: true,
                user: true,
                team: {
                    profile: {
                        proCategories: true
                    }
                }
            }
        });

        if (!photoSession) {
            throw new NotFoundException('Фотосессия не найдена');
        }

        return photoSession;
    }

    async update(id: number, userId: number, dto: PhotoSessionRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(PhotoSession);

            const photoSession = await this.findByIdAndUserId(
                id,
                userId,
                manager
            );

            photoSession.files =
                await this.filesService.findAndvalidateByIdsAndUserId(
                    dto.photoIds,
                    userId,
                    manager
                );

            if (!dto.team.includes(userId)) {
                dto.team.unshift(userId);
            }

            photoSession.team = await this.usersService.findAndValidateByIds(
                dto.team,
                manager
            );

            photoSession.previewFileId = dto.photoIds[0];
            photoSession.name = dto.name;
            photoSession.description = dto.description;
            photoSession.startDate = new Date(dto.startDate);
            photoSession.endDate = new Date(dto.endDate);
            photoSession.type = dto.type;
            photoSession.isPublished = dto.isPublished;

            if (dto.location) {
                const createdLocation = await this.locationsService.create(
                    dto.location
                );
                if (photoSession.location) {
                    photoSession.location.coordinates =
                        createdLocation.coordinates;
                    photoSession.location.place = createdLocation.place;
                    photoSession.location.address = dto.location.address;
                } else {
                    photoSession.location = createdLocation;
                }
            } else {
                if (photoSession.location) {
                    await this.locationsService.deleteByIds(
                        [photoSession.location.id],
                        manager
                    );
                }
                photoSession.location = null;
            }

            await repo.save(photoSession);

            return await this.getDtoById({
                id,
                requesterUserId: userId,
                manager
            });
        });
    }

    async remove(id: number, userId: number) {
        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(PhotoSession);

            const photoSession = await this.findByIdAndUserId(
                id,
                userId,
                manager
            );

            await repo.remove(photoSession);

            return { photoSession: this.createDto(photoSession) };
        });
    }

    async validateByIdsAndUserId(
        ids: number[],
        userId: number,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(PhotoSession)
            : this.photoSessionsRepository;

        ids = [...new Set(ids)];

        const photoSessions = await repo.find({
            where: { id: In(ids), userId }
        });

        if (ids.length != photoSessions.length) {
            throw new NotFoundException('Фотосессия не найдено');
        }
    }

    async bulkRemove(userId: number, ids: number[]) {
        await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(PhotoSession);

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
            ? manager.getRepository(PhotoSession)
            : this.photoSessionsRepository;

        const query = repo
            .createQueryBuilder('photoSession')
            .where('photoSession.id IN (:...ids)', { ids })
            .leftJoinAndSelect('photoSession.previewFile', 'previewFile')
            .leftJoinAndSelect('photoSession.location', 'location')
            .leftJoinAndSelect('location.place', 'locationPlace')
            .leftJoinAndSelect('photoSession.user', 'user')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = photoSession.id')
                    .andWhere('favorite.entityType = :favoriteEntityType');
            }, 'favoritesCount')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Like, 'like')
                    .where('like.entityId = photoSession.id')
                    .andWhere('like.entityType = :likeEntityType');
            }, 'likes_count')
            .addSelect(subQuery => {
                return subQuery
                    .select('id')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = photoSession.id')
                    .andWhere('favorite.entityType = :favoriteEntityType')
                    .andWhere('favorite.userId = :requesterUserId');
            }, 'favoriteId')
            .addSelect(subQuery => {
                return subQuery
                    .select('id')
                    .from(Like, 'like')
                    .where('like.entityId = photoSession.id')
                    .andWhere('like.entityType = :likeEntityType')
                    .andWhere('like.userId = :requesterUserId');
            }, 'likeId')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Review, 'review')
                    .where('review.entityId = photoSession.id')
                    .andWhere('review.entityType = :reviewEntityType')
                    .andWhere('review.isPublished = :reviewIsPublished');
            }, 'reviewsCount')
            .setParameter('favoriteEntityType', EntityType.PHOTO_SESSION)
            .setParameter('likeEntityType', EntityType.PHOTO_SESSION)
            .setParameter('reviewEntityType', EntityType.PHOTO_SESSION)
            .setParameter('reviewIsPublished', true)
            .setParameter('requesterUserId', requesterUserId);

        const { entities, raw } = await query.getRawAndEntities();

        const photoSessions = this.transformRawData(entities, raw);

        return photoSessions.map(fl => this.createBasicDto(fl));
    }

    async exists(id: number) {
        const count = await this.photoSessionsRepository.count({
            where: { id }
        });
        return count > 0;
    }
}
