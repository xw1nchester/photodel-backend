import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Point, Repository } from 'typeorm';

import { ProCategoriesService } from '@pro-categories/pro-categories.service';
import { S3Service } from '@s3/s3.service';
import { SocialsService } from '@socials/socials.service';
import { SpecializationsService } from '@specializations/specializations.service';

import { CreateUserDto } from './dto/create-user.dto';
import { ProfileRequestDto } from './dto/profile-request.dto';
import { ProfileSocial } from './entities/profiles-socials.entity';
import { Profile } from './entities/profiles.entity';
import { TemporaryLocation } from './entities/temporary-locations.entity';
import { User } from './entities/users.entity';

@Injectable()
export class UsersService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Profile)
        private readonly profilesRepository: Repository<Profile>,
        private readonly proCategoriesService: ProCategoriesService,
        private readonly s3Service: S3Service,
        private readonly specializationsService: SpecializationsService,
        private readonly socialsService: SocialsService
    ) {}

    async findById(id: number) {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: { roles: true }
        });

        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        return user;
    }

    async findByEmail(email: string, manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(User)
            : this.usersRepository;

        return await repo.findOne({
            where: { email },
            relations: { roles: true }
        });
    }

    createUserDto(user: User) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar ? this.s3Service.getUrl(user.avatar) : null,
            isAdult: user.isAdult,
            isProfessional: user.isProfessional,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            roles: user.roles.map(r => r.name)
        };
    }

    async createUser(dto: CreateUserDto, manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(User)
            : this.usersRepository;

        const user = repo.create({
            ...dto,
            roles: [],
            profile: {}
        });

        return await repo.save(user);
    }

    async getUserDtoById(id: number) {
        const user = await this.findById(id);
        return { user: this.createUserDto(user) };
    }

    async verifyById(id: number, manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(User)
            : this.usersRepository;

        return await repo.update({ id }, { isVerified: true });
    }

    async findProfileByUserId(id: number, manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(Profile)
            : this.profilesRepository;

        const profile = await repo.findOne({
            where: { user: { id } },
            relations: {
                proCategories: true,
                specializations: true,
                socials: {
                    social: true
                },
                temporaryLocations: true
            }
        });

        if (!profile) {
            throw new NotFoundException('Профиль не найден');
        }

        return profile;
    }

    createProfileDto(profile: Profile) {
        const socials = profile.socials.map(s => ({
            ...s.social,
            value: s.value
        }));

        const temporaryLocations = profile.temporaryLocations.map(loc => ({
            id: loc.id,
            startDate:
                loc.startDate instanceof Date
                    ? loc.startDate.toISOString().split('T')[0]
                    : loc.startDate,
            endDate:
                loc.endDate instanceof Date
                    ? loc.endDate.toISOString().split('T')[0]
                    : loc.endDate,
            longitude: loc.coordinates.coordinates[0],
            latitude: loc.coordinates.coordinates[1],
            comment: loc.comment
        }));

        return { ...profile, socials, temporaryLocations };
    }

    async getProfileDtoByUserId(userId: number, manager?: EntityManager) {
        const profile = await this.findProfileByUserId(userId, manager);
        return { profile: this.createProfileDto(profile) };
    }

    async updateProfile(userId: number, dto: ProfileRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const profilesRepo = manager.getRepository(Profile);
            const profileSocialsRepo = manager.getRepository(ProfileSocial);
            const temporaryLocationsRepo =
                manager.getRepository(TemporaryLocation);

            const profile = await this.findProfileByUserId(userId, manager);

            profile.price = dto.price;
            profile.conditions = dto.conditions;
            profile.equipment = dto.equipment;
            profile.geography = dto.geography;
            profile.languages = dto.languages;
            profile.about = dto.about;

            if (dto.coordinates) {
                const coordinates: Point = {
                    type: 'Point',
                    coordinates: [
                        dto.coordinates.longitude,
                        dto.coordinates.latitude
                    ]
                };

                profile.coordinates = coordinates;
            }

            profile.proCategories =
                await this.proCategoriesService.findAndValidateByIds(
                    dto.proCategoryIds,
                    manager
                );

            profile.specializations =
                await this.specializationsService.findAndValidateByIds(
                    dto.specializationIds,
                    manager
                );

            await profileSocialsRepo.delete({
                profileId: profile.id
            });

            await this.socialsService.validateByIds(
                dto.socials.map(s => s.id),
                manager
            );

            profile.socials = dto.socials.map(dto => {
                const profileSocial = profileSocialsRepo.create({
                    profileId: profile.id,
                    socialId: dto.id,
                    value: dto.value
                });
                return profileSocial;
            });

            await temporaryLocationsRepo.delete({ profileId: profile.id });

            profile.temporaryLocations = dto.temporaryLocations.map(locDto => {
                const coordinates: Point = {
                    type: 'Point',
                    coordinates: [
                        locDto.coordinates.longitude,
                        locDto.coordinates.latitude
                    ]
                };

                return temporaryLocationsRepo.create({
                    profileId: profile.id,
                    startDate: new Date(locDto.startDate),
                    endDate: new Date(locDto.endDate),
                    coordinates,
                    comment: locDto.comment
                });
            });

            await profilesRepo.save(profile);

            return await this.getProfileDtoByUserId(userId, manager);
        });
    }

    async updateAvatar(userId: number, avatar: string) {
        const user = await this.findById(userId);

        await this.usersRepository.update({ id: userId }, { avatar });

        if (avatar != user.avatar) {
            await this.s3Service.deleteFile(user.avatar);
        }

        return await this.getUserDtoById(userId);
    }

    async deleteAvatar(userId: number) {
        const user = await this.findById(userId);

        await this.usersRepository.update({ id: userId }, { avatar: null });

        if (user.avatar) {
            await this.s3Service.deleteFile(user.avatar);
        }

        return await this.getUserDtoById(userId);
    }

    async updatePassword(
        userId: number,
        passwordHash: string,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(User)
            : this.usersRepository;

        await repo.update({ id: userId }, { passwordHash });
    }

    async findNearbyUsers(lat: number, lng: number) {
        const qb = this.usersRepository
            .createQueryBuilder('user')
            .leftJoin('user.profile', 'profile')
            .select([
                'user.id AS id',
                'user.firstName AS "firstName"',
                'user.lastName AS "lastName"',
                'user.avatar AS avatar'
            ])
            .addSelect(
                `
                ST_Distance(
                    profile.coordinates,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
                )
                `,
                'distance'
            )
            .where('profile.coordinates IS NOT NULL')
            .setParameters({ lat, lng });

        const result = await qb.orderBy('distance', 'ASC').getRawMany();

        const users = result.map(user => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            distance: Number((user.distance / 1000).toFixed(1))
        }));

        return { users };
    }
}
