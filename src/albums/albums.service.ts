import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager } from 'typeorm';

import { S3Service } from '@s3/s3.service';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginationDto } from '@shared/dto/pagination.dto';

import { Album } from './album.entity';
import { AlbumRequestDto } from './dto/album-request.dto';

@Injectable()
export class AlbumsService {
    constructor(
        @InjectRepository(Album)
        private readonly albumRepository: Repository<Album>,
        private readonly s3Service: S3Service
    ) {}

    createDto(album: Album) {
        return {
            id: album.id,
            title: album.title,
            description: album.description,
            imageKey: album.image,
            imageUrl: album.image ? this.s3Service.getUrl(album.image) : null,
            isPublished: album.isPublished,
            photosCount: album.photosCount || 0,
            createdAt: album.createdAt,
            updatedAt: album.updatedAt
        };
    }

    async create(userId: number, dto: AlbumRequestDto) {
        const createdAlbum = await this.albumRepository.save({
            title: dto.title,
            description: dto.description,
            image: dto.image,
            userId
        });

        return { album: this.createDto(createdAlbum) };
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

    async getDtoById(id: number) {
        const album = await this.albumRepository
            .createQueryBuilder('album')
            .where('album.id = :id', { id })
            .loadRelationCountAndMap('album.photosCount', 'album.photos')
            .getOne();

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
        album.image = dto.image;
        album.isPublished = dto.isPublished;

        await this.albumRepository.save(album);

        return await this.getDtoById(id);
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
}
