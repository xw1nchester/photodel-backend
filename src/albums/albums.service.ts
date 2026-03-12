import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager, DataSource, Brackets } from 'typeorm';

import { PhotosService } from '@photos/photos.service';
import { S3Service } from '@s3/s3.service';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginationDto } from '@shared/dto/pagination.dto';

import { Album } from './album.entity';
import {
    AlbumCreateRequestDto,
    AlbumRequestDto
} from './dto/album-request.dto';
import { JwtPayload } from '@auth/interfaces';

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

    async findAllByUserId(
        userId: number,
        { page, limit }: PaginationQueryDto,
        isPublished?: boolean
    ) {
        const query = this.albumRepository
            .createQueryBuilder('album')
            .where('album.userId = :userId', { userId })
            .loadRelationCountAndMap('album.photosCount', 'album.photos')
            .orderBy('album.createdAt', 'DESC');

        if (typeof isPublished === 'boolean') {
            query.andWhere('album.isPublished = :isPublished', { isPublished });
        }

        const [albums, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        const albumsDtos = albums.map(album => this.createDto(album));

        return new PaginationDto(albumsDtos, total, page, limit);
    }

    async getDtoById({
        id,
        user
    }: {
        id: number;
        user: Partial<JwtPayload> | null;
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
            );

        if (user) {
            qb.andWhere(
                new Brackets(qb => {
                    qb.where('album.userId = :userId', {
                        userId: user.id
                    }).orWhere('album.isPublished = :isPublished', {
                        isPublished: true
                    });
                })
            );
        } else {
            qb.andWhere('album.isPublished = :isPublished', {
                isPublished: true
            });
        }

        const album = await qb.getOne();

        if (!album) {
            throw new NotFoundException('Альбом с не найден');
        }

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

        return await this.getDtoById({ id, user: { id: album.userId } });
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
}
