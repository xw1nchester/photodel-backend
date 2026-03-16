import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager, DataSource, Brackets } from 'typeorm';

import { FavoriteEntityType } from '@favorites/enums';
import { Favorite } from '@favorites/favorite.entity';
import { PhotosService } from '@photos/photos.service';
import { S3Service } from '@s3/s3.service';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginationDto } from '@shared/dto/pagination.dto';

import { Album } from './album.entity';
import {
    AlbumCreateRequestDto,
    AlbumRequestDto
} from './dto/album-request.dto';

@Injectable()
export class AlbumsService {
    constructor(
        @InjectRepository(Album)
        private readonly albumRepository: Repository<Album>,
        private readonly dataSource: DataSource,
        @Inject(forwardRef(() => PhotosService))
        private readonly photosService: PhotosService,
        private readonly s3Service: S3Service
    ) {}

    createDto(album: Album) {
        return {
            id: album.id,
            title: album.title,
            description: album.description,
            imageKey: album.imageKey,
            imageUrl: album.imageKey
                ? this.s3Service.getUrl(album.imageKey)
                : null,
            isPublished: album.isPublished,
            photosCount: album.photosCount || 0,
            favorites: {
                isFavorite: album.isFavorite,
                favoriteId: album.favoriteId,
                count: album.favoritesCount
            },
            createdAt: album.createdAt,
            updatedAt: album.updatedAt
        };
    }

    async create(userId: number, dto: AlbumCreateRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const albumsRepo = manager.getRepository(Album);

            const photos =
                await this.photosService.findAndValidateByIdsAndUserId(
                    dto.photoIds,
                    userId,
                    manager
                );

            const createdAlbum = await albumsRepo.save({
                title: dto.title,
                description: dto.description,
                imageKey: dto.image,
                isPublished: dto.isPublished,
                userId,
                photos
            });

            createdAlbum.photosCount = photos.length;

            return { album: this.createDto(createdAlbum) };
        });
    }

    async findByUserId({
        targetUserId,
        requesterUserId,
        pagination,
        isPublished
    }: {
        targetUserId: number;
        requesterUserId?: number;
        pagination: PaginationQueryDto;
        isPublished?: boolean;
    }) {
        const { page, limit } = pagination;

        const query = this.albumRepository
            .createQueryBuilder('album')
            .where('album.userId = :targetUserId', { targetUserId })
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
                    .where('favorite.entityId = album.id')
                    .andWhere('favorite.entityType = :entityType');
            }, 'favoritesCount')
            .setParameter('entityType', FavoriteEntityType.ALBUM)
            .orderBy('album.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (requesterUserId != undefined) {
            query
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Favorite, 'favorite')
                        .where('favorite.entityId = album.id')
                        .andWhere('favorite.entityType = :type')
                        .andWhere('favorite.userId = :requesterUserId');
                }, 'favoriteId')
                .setParameter('type', FavoriteEntityType.ALBUM)
                .setParameter('requesterUserId', requesterUserId);
        }

        if (isPublished != undefined) {
            query.andWhere('album.isPublished = :isPublished', {
                isPublished: true
            });
        }

        const { entities, raw } = await query.getRawAndEntities();

        const total = await query.getCount();

        const albums = entities.map((album, index) => {
            album.isFavorite = !!raw[index].favoriteId;
            album.favoriteId = raw[index].favoriteId;
            album.favoritesCount = Number(raw[index].favoritesCount);
            return album;
        });

        const albumsDtos = albums.map(album => this.createDto(album));

        return new PaginationDto(albumsDtos, total, page, limit);
    }

    async findByIds(ids: number[], requesterUserId: number) {
        if (ids.length == 0) return [];
        
        const query = this.albumRepository
            .createQueryBuilder('album')
            .where('album.id IN (:...ids)', { ids })
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
                    .where('favorite.entityId = album.id')
                    .andWhere('favorite.entityType = :type');
            }, 'favoritesCount')
            // как вариант вообще убрать, т.к. метод используется при запросе избранных
            .addSelect(subQuery => {
                return subQuery
                    .select('id')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = album.id')
                    .andWhere('favorite.entityType = :type')
                    .andWhere('favorite.userId = :requesterUserId');
            }, 'favoriteId')
            .setParameter('type', FavoriteEntityType.ALBUM)
            .setParameter('requesterUserId', requesterUserId);

        const { entities, raw } = await query.getRawAndEntities();

        const albums = entities.map((album, index) => {
            album.isFavorite = !!raw[index].favoriteId;
            album.favoriteId = raw[index].favoriteId;
            album.favoritesCount = Number(raw[index].favoritesCount);
            return album;
        });

        return albums.map(album => this.createDto(album));
    }

    async getDtoById({
        id,
        requesterUserId
    }: {
        id: number;
        requesterUserId: number;
    }) {
        const qb = this.albumRepository
            .createQueryBuilder('album')
            .where('album.id = :id', { id })
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
                    .where('favorite.entityId = album.id')
                    .andWhere('favorite.entityType = :entityType');
            }, 'favoritesCount')
            .setParameter('entityType', FavoriteEntityType.ALBUM);

        if (requesterUserId) {
            qb.andWhere(
                new Brackets(qb => {
                    qb.where('album.userId = :requesterUserId', {
                        requesterUserId
                    }).orWhere('album.isPublished = :isPublished', {
                        isPublished: true
                    });
                })
            )
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Favorite, 'favorite')
                        .where('favorite.entityId = album.id')
                        .andWhere('favorite.entityType = :type')
                        .andWhere('favorite.userId = :requesterUserId');
                }, 'favoriteId')
                .setParameter('type', FavoriteEntityType.ALBUM)
                .setParameter('requesterUserId', requesterUserId);
        } else {
            qb.andWhere('album.isPublished = :isPublished', {
                isPublished: true
            });
        }

        const result = await qb.getRawAndEntities();

        const album = result.entities[0];

        if (!album) {
            throw new NotFoundException('Альбом с не найден');
        }

        album.isFavorite = !!result.raw[0].favoriteId;
        album.favoriteId = result.raw[0].favoriteId;
        album.favoritesCount = Number(result.raw[0].favoritesCount);

        return { album: this.createDto(album) };
    }

    async findByIdAndUserId(id: number, userId: number) {
        const album = await this.albumRepository.findOne({
            where: { id, userId }
        });

        if (!album) {
            throw new NotFoundException('Альбом не найден');
        }

        return album;
    }

    async update(id: number, userId: number, dto: AlbumRequestDto) {
        const album = await this.findByIdAndUserId(id, userId);

        album.title = dto.title;
        album.description = dto.description;
        album.imageKey = dto.image;
        album.isPublished = dto.isPublished;

        await this.albumRepository.save(album);

        return await this.getDtoById({ id, requesterUserId: album.userId });
    }

    async remove(id: number, userId: number) {
        const album = await this.findByIdAndUserId(id, userId);

        await this.albumRepository.remove(album);

        return { album: this.createDto(album) };
    }

    async findAndValidateByIdsAndUserId(
        ids: number[],
        userId: number,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(Album)
            : this.albumRepository;

        ids = [...new Set(ids)];

        const albums = await repo.find({
            where: { id: In(ids), userId }
        });

        if (ids.length != albums.length) {
            throw new NotFoundException('Альбом не найден');
        }

        return albums;
    }

    async bulkRemove(userId: number, ids: number[]) {
        await this.findAndValidateByIdsAndUserId(ids, userId);

        await this.albumRepository.delete({
            id: In(ids)
        });
    }

    async addPhotos(userId: number, albumId: number, photoIds: number[]) {
        await this.findByIdAndUserId(albumId, userId);

        await this.photosService.findAndValidateByIdsAndUserId(
            photoIds,
            userId
        );

        await this.dataSource
            .createQueryBuilder()
            .insert()
            .into('photos_albums')
            .values(
                photoIds.map(photoId => ({
                    album_id: albumId,
                    photo_id: photoId
                }))
            )
            .orIgnore() // игнорировать уже существующие записи
            .execute();
    }

    async removePhotos(userId: number, albumId: number, photoIds: number[]) {
        await this.findByIdAndUserId(albumId, userId);

        await this.photosService.findAndValidateByIdsAndUserId(
            photoIds,
            userId
        );

        await this.dataSource
            .createQueryBuilder()
            .relation(Album, 'photos')
            .of(albumId)
            .remove(photoIds);
    }

    async exists(id: number) {
        const count = await this.albumRepository.count({ where: { id } });
        return count > 0;
    }
}
