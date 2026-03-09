import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';

import { AlbumsService } from '@albums/albums.service';
import { Location } from '@locations/location.entity';
import { LocationsService } from '@locations/locations.service';
import { S3Service } from '@s3/s3.service';
import { PaginationDto } from '@shared/dto/pagination.dto';
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
        // чтобы модуль фото не зависел от модуля юзеров
        const user = {
            id: photo.user.id,
            firstName: photo.user.firstName,
            lastName: photo.user.lastName,
            avatarKey: photo.user.avatar,
            avatarUrl: photo.user.avatar
                ? this.s3Service.getUrl(photo.user.avatar)
                : null,
            isPro: photo.user.isPro
        };

        return {
            id: photo.id,
            imageKey: photo.image,
            imageUrl: this.s3Service.getUrl(photo.image),
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
            albums: photo.albums,
            createdAt: photo.createdAt,
            updatedAt: photo.updatedAt,
            user
        };
    }

    async create(userId: number, dto: PhotoRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const photosRepo = manager.getRepository(Photo);

            let location: Location | null = null;
            if (dto.location) {
                location = this.locationsService.create(dto.location);
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
                image: dto.image,
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

            const photo = await this.getDtoById(createdPhoto.id, manager);

            return { photo };
        });
    }

    async findAllByUserId({
        userId,
        page,
        limit,
        albumId,
        isPublished
    }: {
        userId: number;
        page: number;
        limit: number;
        albumId?: number;
        isPublished?: boolean;
    }) {
        const query = this.photoRepository
            .createQueryBuilder('photo')
            .leftJoinAndSelect('photo.location', 'location')
            .leftJoinAndSelect('photo.specializations', 'specialization')
            .leftJoinAndSelect('photo.albums', 'album')
            .leftJoinAndSelect('photo.user', 'user')
            .where('user.id = :userId', { userId })
            .orderBy('photo.createdAt', 'DESC')
            .take(limit)
            .skip((page - 1) * limit);

        if (albumId != undefined) {
            query.andWhere(
                `(album.id = :albumId AND (album.userId = :userId OR album.isPublished = true))`,
                { albumId, userId }
            );
        }

        if (isPublished != undefined) {
            query.andWhere('photo.isPublished = :isPublished', { isPublished });
        }

        const [photos, total] = await query.getManyAndCount();

        const photosDtos = photos.map(photo => this.createDto(photo));

        return new PaginationDto(photosDtos, total, page, limit);
    }

    async getDtoById(id: number, manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(Photo)
            : this.photoRepository;

        const photo = await repo.findOne({
            where: { id },
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

            photo.image = dto.image;
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
                const createdLocation = this.locationsService.create(
                    dto.location
                );
                if (photo.location) {
                    photo.location.coordinates = createdLocation.coordinates;
                    photo.location.country = dto.location.country;
                    photo.location.city = dto.location.city;
                    photo.location.street = dto.location.street;
                    photo.location.houseNumber = dto.location.houseNumber;
                } else {
                    photo.location = createdLocation;
                }
            } else {
                if (photo.location) {
                    await this.locationsService.deleteByIds(
                        [photo.location.id],
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

            return await this.getDtoById(id, manager);
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
