import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Point } from 'typeorm';

import { AlbumService } from '@album/album.service';
import { Location } from '@location/location.entity';
import { SpecializationsService } from '@specializations/specializations.service';

import { PhotoRequestDto } from './dto/photo-request.dto';
import { Photo } from './photo.entity';

@Injectable()
export class PhotoService {
    constructor(
        @InjectRepository(Photo)
        private readonly photoRepository: Repository<Photo>,
        // @InjectRepository(Location)
        // private readonly locationsRepository: Repository<Location>,
        private readonly dataSource: DataSource,
        private readonly specializationsService: SpecializationsService,
        private readonly albumService: AlbumService
    ) {}

    getPhotoDto(photo: Photo) {
        return {
            id: photo.id,
            name: photo.name,
            description: photo.description,
            // TODO: нужен метод в сервисе location
            location: photo.location
                ? {
                      id: photo.location.id,
                      latitude: photo.location.coordinates.coordinates[1],
                      longitude: photo.location.coordinates.coordinates[0],
                      country: photo.location.country,
                      city: photo.location.city,
                      street: photo.location.street,
                      houseNumber: photo.location.houseNumber
                  }
                : null,
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
            createdAt: photo.createdAt.toISOString(),
            updatedAt: photo.updatedAt.toISOString()
        };
    }

    async create(userId: number, dto: PhotoRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const photosRepo = manager.getRepository(Photo);
            // TODO: думаю стоит вынести в сервис location
            const locationsRepo = manager.getRepository(Location);

            let location: Location | null = null;
            if (dto.location) {
                const coordinates: Point = {
                    type: 'Point',
                    coordinates: [dto.location.longitude, dto.location.latitude]
                };

                location = locationsRepo.create({
                    coordinates,
                    country: dto.location.country,
                    city: dto.location.city,
                    street: dto.location.street,
                    houseNumber: dto.location.houseNumber
                });
                // location = await locationsRepo.save(location);
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

            // TODO: поправить баг с созданием альбомов
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

    async getDtoById(id: number) {
        const photo = await this.photoRepository.findOne({
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
            relations: ['location', 'specializations', 'albums']
        });

        if (!photo) {
            throw new NotFoundException('Фотография не найдена');
        }

        return photo;
    }

    async update(id: number, userId: number, dto: PhotoRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const photosRepo = manager.getRepository(Photo);
            const locationsRepo = manager.getRepository(Location);

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
                const coordinates: Point = {
                    type: 'Point',
                    coordinates: [dto.location.longitude, dto.location.latitude]
                };

                let location: Location;
                if (photo.location) {
                    location = photo.location;
                    location.coordinates = coordinates;
                    location.country = dto.location.country;
                    location.city = dto.location.city;
                    location.street = dto.location.street;
                    location.houseNumber = dto.location.houseNumber;
                    location = await locationsRepo.save(location);
                } else {
                    location = locationsRepo.create({
                        coordinates,
                        country: dto.location.country,
                        city: dto.location.city,
                        street: dto.location.street,
                        houseNumber: dto.location.houseNumber
                    });
                    // location = await locationsRepo.save(location);
                }
                photo.location = location;
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

            return await this.getDtoById(id);
        });
    }

    async remove(id: number, userId: number) {
        const photo = await this.findByIdAndUserId(id, userId);

        await this.photoRepository.remove(photo);

        return { photo: this.getPhotoDto(photo) };
    }
}
