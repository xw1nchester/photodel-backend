import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { Location } from '@locations/location.entity';
import { SpecializationsService } from '@specializations/specializations.service';

import { PhotoRequestDto } from './dto/photo-request.dto';
import { Photo } from './photo.entity';
import { AlbumsService } from '@albums/albums.service';
import { LocationsService } from '@locations/locations.service';

@Injectable()
export class PhotosService {
    constructor(
        @InjectRepository(Photo)
        private readonly photoRepository: Repository<Photo>,
        private readonly dataSource: DataSource,
        private readonly specializationsService: SpecializationsService,
        private readonly albumService: AlbumsService,
        private readonly locationsService: LocationsService
    ) {}

    getPhotoDto(photo: Photo) {
        return {
            id: photo.id,
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
            // userId: photo.userId,
            specializations: photo.specializations,
            albums: photo.albums,
            createdAt: photo.createdAt,
            updatedAt: photo.updatedAt
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

            const albums = await this.albumService.findAndValidateByIds(
                dto.albumIds,
                userId,
                manager
            );

            const createdPhoto = await photosRepo.save({
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

            return { photo: this.getPhotoDto(createdPhoto) };
        });
    }

    async findAllByUserId(userId: number) {
        const photos = await this.photoRepository.find({
            where: { userId },
            relations: {
                location: true,
                specializations: true,
                albums: true
            },
            order: { createdAt: 'DESC' }
        });

        const photosDtos = photos.map(photo => this.getPhotoDto(photo));

        return { photos: photosDtos };
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
                albums: true
            }
        });

        if (!photo) {
            throw new NotFoundException('Фотография не найдена');
        }

        return { photo: this.getPhotoDto(photo) };
    }

    async findByIdAndUserId(id: number, userId: number) {
        const photo = await this.photoRepository.findOne({
            where: { id, userId },
            relations: {
                location: true,
                specializations: true,
                albums: true
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

            photo.albums = await this.albumService.findAndValidateByIds(
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

        return { photo: this.getPhotoDto(photo) };
    }
}
