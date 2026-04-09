import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, EntityManager, In, Repository } from 'typeorm';

import { AlbumsService } from '@albums/albums.service';
import { Favorite } from '@favorites/favorite.entity';
import { Like } from '@likes/like.entity';
import { Location } from '@locations/entities/location.entity';
import { LocationsService } from '@locations/locations.service';
import { Review } from '@reviews/review.entity';
import { S3Service } from '@s3/s3.service';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginationDto } from '@shared/dto/pagination.dto';
import { EntityType } from '@shared/enums/entity-type.enums';
import { SortOption } from '@shared/enums/sort-option.enum';
import { SpecializationsService } from '@specializations/specializations.service';

import { PhotoRequestDto } from './dto/photo-request.dto';
import { Photo } from './photo.entity';

@Injectable()
export class PhotosService {
    constructor(
        @InjectRepository(Photo)
        private readonly photoRepository: Repository<Photo>,
        private readonly dataSource: DataSource,
        private readonly specializationsService: SpecializationsService,
        @Inject(forwardRef(() => AlbumsService))
        private readonly albumService: AlbumsService,
        private readonly locationsService: LocationsService,
        private readonly s3Service: S3Service
    ) {}

    createDto(photo: Photo) {
        const albums = photo.albums.map(a => this.albumService.createDto(a));

        // чтобы модуль фото не зависел от модуля юзеров
        const user = {
            id: photo.user.id,
            firstName: photo.user.firstName,
            lastName: photo.user.lastName,
            avatarKey: photo.user.avatarKey,
            avatarUrl: photo.user.avatarKey
                ? this.s3Service.getUrl(photo.user.avatarKey)
                : null,
            isPro: photo.user.isPro
        };

        return {
            id: photo.id,
            imageKey: photo.imageKey,
            imageUrl: this.s3Service.getUrl(photo.imageKey),
            name: photo.name,
            description: photo.description,
            location: this.locationsService.getDto(photo.location),
            camera: photo.camera,
            aperture: photo.aperture,
            focalLength: photo.focalLength,
            shutterSpeed: photo.shutterSpeed,
            iso: photo.iso,
            flash: photo.flash,
            isForSale: photo.isForSale,
            isPublished: photo.isPublished,
            specializations: photo.specializations,
            albums,
            createdAt: photo.createdAt,
            updatedAt: photo.updatedAt,
            user,
            favorites: {
                isFavorite: photo.isFavorite,
                favoriteId: photo.favoriteId,
                count: photo.favoritesCount
            },
            likes: {
                isLiked: photo.isLiked,
                likeId: photo.likeId,
                count: photo.likesCount
            },
            reviews: {
                count: photo.reviewsCount
            }
        };
    }

    async create(userId: number, dto: PhotoRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const photosRepo = manager.getRepository(Photo);

            let location: Location | null = null;
            if (dto.location) {
                location = await this.locationsService.create(dto.location);
            }

            const specializations =
                await this.specializationsService.findAndValidateByIds(
                    dto.specializationIds,
                    manager
                );

            const albums =
                await this.albumService.findAndValidateByIdsAndUserId(
                    dto.albumIds,
                    userId,
                    manager
                );

            const createdPhoto = await photosRepo.save({
                imageKey: dto.image,
                name: dto.name,
                description: dto.description,
                location,
                camera: dto.camera,
                aperture: dto.aperture,
                focalLength: dto.focalLength,
                shutterSpeed: dto.shutterSpeed,
                iso: dto.iso,
                flash: dto.flash,
                isForSale: dto.isForSale,
                isPublished: dto.isPublished,
                userId,
                specializations,
                albums
            });

            return await this.getDtoById({
                id: createdPhoto.id,
                requesterUserId: userId,
                manager
            });
        });
    }

    private transformPhotosRawData(entities: Photo[], raw: any[]) {
        const rawMap = new Map();

        for (const r of raw) {
            rawMap.set(r.photo_id, r);
        }

        return entities.map(photo => {
            const r = rawMap.get(photo.id);
            photo.isFavorite = !!r.favoriteId;
            photo.favoriteId = r.favoriteId;
            photo.favoritesCount = Number(r.favoritesCount);

            photo.isLiked = !!r.likeId;
            photo.likeId = r.likeId;
            photo.likesCount = Number(r.likes_count);

            photo.reviewsCount = Number(r.reviewsCount);

            return photo;
        });
    }

    // TODO: типизировать параметры по аналогии findProfessionals и передавать query
    async findAll({
        pagination,
        sort,
        requesterUserId,
        targetUserId,
        albumId,
        excludedAlbumId,
        my,
        search,
        specializationId
    }: {
        pagination: PaginationQueryDto;
        sort: SortOption;
        requesterUserId?: number;
        targetUserId?: number;
        albumId?: number;
        excludedAlbumId?: number;
        my?: boolean;
        search?: string;
        specializationId?: number;
    }) {
        const { page, limit } = pagination;

        const query = this.photoRepository
            .createQueryBuilder('photo')
            .leftJoinAndSelect('photo.location', 'location')
            .leftJoinAndSelect('location.place', 'locationPlace')
            .leftJoinAndSelect('photo.specializations', 'specialization')
            .leftJoinAndSelect(
                'photo.albums',
                'album',
                'album.isPublished = :albumIsPublished',
                { albumIsPublished: true }
            )
            .leftJoinAndSelect('photo.user', 'user')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = photo.id')
                    .andWhere('favorite.entityType = :favoriteEntityType');
            }, 'favoritesCount')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Like, 'like')
                    .where('like.entityId = photo.id')
                    .andWhere('like.entityType = :likeEntityType');
            }, 'likes_count')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Review, 'review')
                    .where('review.entityId = photo.id')
                    .andWhere('review.entityType = :reviewEntityType')
                    .andWhere('review.isPublished = :reviewIsPublished');
            }, 'reviewsCount')
            .setParameter('favoriteEntityType', EntityType.PHOTO)
            .setParameter('likeEntityType', EntityType.PHOTO)
            .setParameter('reviewEntityType', EntityType.PHOTO)
            .setParameter('reviewIsPublished', true)
            .take(limit)
            .skip((page - 1) * limit);

        switch (sort) {
            case SortOption.NEWEST:
                query.orderBy('photo.createdAt', 'DESC');
                break;

            case SortOption.POPULARITY:
                query.orderBy(`likes_count`, 'DESC');
                break;

            // SortOption.DISTANCE

            default:
                query.orderBy('photo.createdAt', 'DESC');
                break;
        }

        if (albumId != undefined) {
            query
                .andWhere(qb => {
                    const subQuery = qb
                        .subQuery()
                        .select('1')
                        .from('photos_albums', 'pa')
                        .innerJoin('albums', 'a', 'a.id = pa.album_id')
                        .where('pa.photo_id = photo.id')
                        .andWhere('pa.album_id = :albumId')
                        .andWhere(
                            '(a.user_id = :userId OR a.is_published = true)'
                        )
                        .getQuery();

                    return `EXISTS ${subQuery}`;
                })
                .setParameters({
                    albumId,
                    userId: targetUserId
                });
        }

        if (excludedAlbumId != undefined) {
            query
                .andWhere(qb => {
                    const subQuery = qb
                        .subQuery()
                        .select('1')
                        .from('photos_albums', 'pa')
                        .where('pa.photo_id = photo.id')
                        .andWhere('pa.album_id = :excludedAlbumId')
                        .getQuery();

                    return `NOT EXISTS ${subQuery}`;
                })
                .setParameter('excludedAlbumId', excludedAlbumId);
        }

        if (requesterUserId != undefined) {
            query
                .andWhere(
                    new Brackets(qb => {
                        qb.where('photo.userId = :requesterUserId', {
                            requesterUserId
                        }).orWhere('photo.isPublished = :isPublished', {
                            isPublished: true
                        });
                    })
                )
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Favorite, 'favorite')
                        .where('favorite.entityId = photo.id')
                        .andWhere('favorite.entityType = :favoriteEntityType')
                        .andWhere('favorite.userId = :requesterUserId');
                }, 'favoriteId')
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Like, 'like')
                        .where('like.entityId = photo.id')
                        .andWhere('like.entityType = :likeEntityType')
                        .andWhere('like.userId = :requesterUserId');
                }, 'likeId')
                .setParameter('requesterUserId', requesterUserId);
        } else {
            query.andWhere('photo.isPublished = :isPublished', {
                isPublished: true
            });
        }

        if (my && requesterUserId != undefined) {
            query.andWhere('photo.userId = :requesterUserId', {
                requesterUserId
            });
        }

        if (targetUserId != undefined) {
            query.andWhere('photo.userId = :targetUserId', { targetUserId });
        }

        if (search) {
            query.andWhere(
                `photo.name ILIKE :search`,
                { search: `%${search}%` }
            );
        }

        if (specializationId != undefined) {
            query.andWhere(qb2 => {
                const subQuery = qb2
                    .subQuery()
                    .select('1')
                    .from('photos_specializations', 'ps')
                    .where('ps.photo_id = photo.id')
                    .andWhere('ps.specialization_id = :specializationId')
                    .getQuery();

                return `EXISTS ${subQuery}`;
            }).setParameter('specializationId', specializationId);
        }

        const { entities, raw } = await query.getRawAndEntities();

        const total = await query.getCount();

        const photos = this.transformPhotosRawData(entities, raw);

        const photosDtos = photos.map(photo => this.createDto(photo));

        return new PaginationDto(photosDtos, total, page, limit);
    }

    async findByIds(
        ids: number[],
        requesterUserId: number,
        manager?: EntityManager
    ) {
        if (ids.length == 0) return [];

        const repo = manager
            ? manager.getRepository(Photo)
            : this.photoRepository;

        const query = repo
            .createQueryBuilder('photo')
            .where('photo.id IN (:...ids)', { ids })
            .leftJoinAndSelect('photo.location', 'location')
            .leftJoinAndSelect('location.place', 'locationPlace')
            .leftJoinAndSelect('photo.specializations', 'specialization')
            .leftJoinAndSelect(
                'photo.albums',
                'album',
                'album.isPublished = :isPublished',
                { isPublished: true }
            )
            .leftJoinAndSelect('photo.user', 'user')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = photo.id')
                    .andWhere('favorite.entityType = :favoriteEntityType');
            }, 'favoritesCount')
            .addSelect(subQuery => {
                return subQuery
                    .select('id')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = photo.id')
                    .andWhere('favorite.entityType = :favoriteEntityType')
                    .andWhere('favorite.userId = :requesterUserId');
            }, 'favoriteId')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Like, 'like')
                    .where('like.entityId = photo.id')
                    .andWhere('like.entityType = :likeEntityType');
            }, 'likes_count')
            .addSelect(subQuery => {
                return subQuery
                    .select('id')
                    .from(Like, 'like')
                    .where('like.entityId = photo.id')
                    .andWhere('like.entityType = :likeEntityType')
                    .andWhere('like.userId = :requesterUserId');
            }, 'likeId')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Review, 'review')
                    .where('review.entityId = photo.id')
                    .andWhere('review.entityType = :reviewEntityType')
                    .andWhere('review.isPublished = :reviewIsPublished');
            }, 'reviewsCount')
            .setParameter('favoriteEntityType', EntityType.PHOTO)
            .setParameter('likeEntityType', EntityType.PHOTO)
            .setParameter('reviewEntityType', EntityType.PHOTO)
            .setParameter('reviewIsPublished', true)
            .setParameter('requesterUserId', requesterUserId);

        const { entities, raw } = await query.getRawAndEntities();

        const photos = this.transformPhotosRawData(entities, raw);

        return photos.map(photo => this.createDto(photo));
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
            ? manager.getRepository(Photo)
            : this.photoRepository;

        const query = repo
            .createQueryBuilder('photo')
            .where('photo.id = :id', { id })
            .leftJoinAndSelect(
                'photo.albums',
                'album',
                'album.isPublished = :isPublished',
                { isPublished: true }
            )
            .leftJoinAndSelect('photo.location', 'location')
            .leftJoinAndSelect('location.place', 'locationPlace')
            .leftJoinAndSelect('photo.specializations', 'specializations')
            .leftJoinAndSelect('photo.user', 'user')
            .loadRelationCountAndMap(
                'album.photosCount',
                'album.photos',
                'albumPhotos',
                qb =>
                    qb.where('albumPhotos.isPublished = :isPublished', {
                        isPublished: true
                    })
            )
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = photo.id')
                    .andWhere('favorite.entityType = :favoriteEntityType');
            }, 'favoritesCount')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Like, 'like')
                    .where('like.entityId = photo.id')
                    .andWhere('like.entityType = :likeEntityType');
            }, 'likes_count')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Review, 'review')
                    .where('review.entityId = photo.id')
                    .andWhere('review.entityType = :reviewEntityType')
                    .andWhere('review.isPublished = :reviewIsPublished');
            }, 'reviewsCount')
            .setParameter('favoriteEntityType', EntityType.PHOTO)
            .setParameter('likeEntityType', EntityType.PHOTO)
            .setParameter('reviewEntityType', EntityType.PHOTO)
            .setParameter('reviewIsPublished', true);

        if (requesterUserId != undefined) {
            query
                .andWhere(
                    new Brackets(qb => {
                        qb.where('photo.userId = :requesterUserId', {
                            requesterUserId
                        }).orWhere('photo.isPublished = :isPublished', {
                            isPublished: true
                        });
                    })
                )
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Favorite, 'favorite')
                        .where('favorite.entityId = photo.id')
                        .andWhere('favorite.entityType = :favoriteEntityType')
                        .andWhere('favorite.userId = :requesterUserId');
                }, 'favoriteId')
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Like, 'like')
                        .where('like.entityId = photo.id')
                        .andWhere('like.entityType = :likeEntityType')
                        .andWhere('like.userId = :requesterUserId');
                }, 'likeId')
                .setParameter('requesterUserId', requesterUserId);
        } else {
            query.andWhere('photo.isPublished = :isPublished', {
                isPublished: true
            });
        }

        const { entities, raw } = await query.getRawAndEntities();

        const photo = this.transformPhotosRawData(entities, raw)[0];

        if (!photo) {
            throw new NotFoundException('Фотография не найдена');
        }

        return { photo: this.createDto(photo) };
    }

    async findByIdAndUserId(id: number, userId: number) {
        const photo = await this.photoRepository.findOne({
            where: { id, userId },
            relations: {
                location: true,
                specializations: true,
                albums: true,
                user: true
            }
        });

        if (!photo) {
            throw new NotFoundException('Фотография не найдена');
        }

        return photo;
    }

    async update(id: number, userId: number, dto: PhotoRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const photosRepo = manager.getRepository(Photo);

            const photo = await this.findByIdAndUserId(id, userId);

            photo.imageKey = dto.image;
            photo.name = dto.name;
            photo.description = dto.description;
            photo.camera = dto.camera;
            photo.aperture = dto.aperture;
            photo.focalLength = dto.focalLength;
            photo.shutterSpeed = dto.shutterSpeed;
            photo.iso = dto.iso;
            photo.flash = dto.flash;
            photo.isForSale = dto.isForSale;
            photo.isPublished = dto.isPublished;

            if (dto.location) {
                const createdLocation = await this.locationsService.create(
                    dto.location
                );
                if (photo.location) {
                    photo.location.coordinates = createdLocation.coordinates;
                    photo.location.place = createdLocation.place;
                    photo.location.address = dto.location.address;
                } else {
                    photo.location = createdLocation;
                }
            } else {
                if (photo.location) {
                    await this.locationsService.deleteByIds(
                        photo.location.id,
                        manager
                    );
                }
                photo.location = null;
            }

            photo.specializations =
                await this.specializationsService.findAndValidateByIds(
                    dto.specializationIds,
                    manager
                );

            photo.albums =
                await this.albumService.findAndValidateByIdsAndUserId(
                    dto.albumIds,
                    userId,
                    manager
                );

            await photosRepo.save(photo);

            return await this.getDtoById({
                id,
                requesterUserId: userId,
                manager
            });
        });
    }

    async remove(id: number, userId: number) {
        const photo = await this.findByIdAndUserId(id, userId);

        await this.photoRepository.remove(photo);

        return { photo: this.createDto(photo) };
    }

    async exists(id: number) {
        const count = await this.photoRepository.count({ where: { id } });
        return count > 0;
    }

    async findAndValidateByIdsAndUserId(
        ids: number[],
        userId: number,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(Photo)
            : this.photoRepository;

        ids = [...new Set(ids)];

        const photos = await repo.find({
            where: { id: In(ids), userId }
        });

        if (ids.length != photos.length) {
            throw new NotFoundException('Фото не найдено');
        }

        return photos;
    }

    async bulkRemove(userId: number, ids: number[]) {
        await this.findAndValidateByIdsAndUserId(ids, userId);

        await this.photoRepository.delete({
            id: In(ids)
        });
    }
}
