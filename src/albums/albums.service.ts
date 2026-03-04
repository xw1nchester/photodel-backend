import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager } from 'typeorm';

import { S3Service } from '@s3/s3.service';

import { Album } from './album.entity';
import { AlbumRequestDto } from './dto/album-request.dto';

@Injectable()
export class AlbumsService {
    constructor(
        @InjectRepository(Album)
        private readonly albumRepository: Repository<Album>,
        private readonly s3Service: S3Service
    ) {}

    getAlbumDto(album: Album) {
        return {
            id: album.id,
            title: album.title,
            description: album.description,
            image: album.image ? this.s3Service.getUrl(album.image) : null,
            isPublished: album.isPublished,
            userId: album.userId,
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

        return { album: this.getAlbumDto(createdAlbum) };
    }

    async findAllByUserId(userId: number) {
        const albums = await this.albumRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' }
        });

        const albumsDtos = albums.map(album => this.getAlbumDto(album));

        return { albums: albumsDtos };
    }

    async getDtoById(id: number) {
        const album = await this.albumRepository.findOne({
            where: { id }
        });

        if (!album) {
            throw new NotFoundException('Альбом с не найден');
        }

        return { album: this.getAlbumDto(album) };
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

        return { album: this.getAlbumDto(album) };
    }

    async findAndValidateByIds(
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
}
