import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { FavoriteEntityType } from '@favorites/enums';
import { Favorite } from '@favorites/favorite.entity';
import { LocationsService } from '@locations/locations.service';
import { ProCategoriesService } from '@pro-categories/pro-categories.service';
import { S3Service } from '@s3/s3.service';
import { SocialsService } from '@socials/socials.service';
import { SpecializationsService } from '@specializations/specializations.service';

import { CreateUserDto } from './dto/create-user.dto';
import { ProfileRequestDto } from './dto/profile-request.dto';
import { UpdateNameRequestDto } from './dto/update-name-request.dto';
import { ProfileSocial } from './entities/profile-social.entity';
import { Profile } from './entities/profile.entity';
import { TemporaryLocation } from './entities/temporary-location.entity';
import { User } from './entities/user.entity';
import { UsersSearchQueryDto } from './dto/users-search-query.dto';
import { PaginationDto } from '@shared/dto/pagination.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Profile)
        private readonly profilesRepository: Repository<Profile>,
        private readonly proCategoriesService: ProCategoriesService,
        private readonly s3Service: S3Service,
        private readonly specializationsService: SpecializationsService,
        private readonly socialsService: SocialsService,
        private readonly locationsService: LocationsService
    ) {}

    async findById(id: number) {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: {
                roles: true,
                profile: {
                    location: {
                        place: true
                    }
                }
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarKey: true,
                isAdult: true,
                isProfessional: true,
                isVerified: true,
                isPro: true,
                createdAt: true,
                roles: {
                    id: true,
                    name: true
                },
                profile: {
                    id: true,
                    location: {
                        id: true,
                        coordinates: true,
                        address: true,
                        place: {
                            id: true,
                            coordinates: true,
                            country: true,
                            city: true
                        }
                    }
                }
            }
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

    // TODO: учитывать временную локацию
    createUserMeDto(user: User) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarKey: user.avatarKey,
            avatarUrl: user.avatarKey
                ? this.s3Service.getUrl(user.avatarKey)
                : null,
            isAdult: user.isAdult,
            isProfessional: user.isProfessional,
            isVerified: user.isVerified,
            isPro: user.isPro,
            createdAt: user.createdAt,
            roles: user.roles.map(r => r.name),
            location: this.locationsService.getDto(user.profile.location)
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

    async getUserMeDtoById(id: number) {
        const user = await this.findById(id);
        return { user: this.createUserMeDto(user) };
    }

    async verifyById(id: number, manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(User)
            : this.usersRepository;

        return await repo.update({ id }, { isVerified: true });
    }

    // TODO: считать расстояние
    async findProfileByUserId({
        targetUserId,
        requesterUserId,
        manager
    }: {
        targetUserId: number;
        requesterUserId?: number;
        manager?: EntityManager;
    }) {
        const repo = manager
            ? manager.getRepository(Profile)
            : this.profilesRepository;

        const qb = repo
            .createQueryBuilder('profile')
            .innerJoinAndSelect('profile.user', 'user')
            .leftJoinAndSelect('profile.location', 'location')
            .leftJoinAndSelect('location.place', 'locationPlace')
            .leftJoinAndSelect('profile.proCategories', 'proCategories')
            .leftJoinAndSelect('profile.specializations', 'specializations')
            .leftJoinAndSelect('profile.socials', 'profileSocial')
            .leftJoinAndSelect('profileSocial.social', 'social')
            .leftJoinAndSelect(
                'profile.temporaryLocations',
                'temporaryLocation'
            )
            .leftJoinAndSelect('temporaryLocation.location', 'tempLocation')
            .leftJoinAndSelect('tempLocation.place', 'tempLocationPlace')
            .where('user.id = :targetUserId', { targetUserId })
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = user.id')
                    .andWhere('favorite.entityType = :entityType');
            }, 'favoritesCount')
            .setParameter('entityType', FavoriteEntityType.USER);

        if (requesterUserId !== undefined) {
            qb.addSelect(subQuery => {
                return subQuery
                    .select('id')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = user.id')
                    .andWhere('favorite.entityType = :type')
                    .andWhere('favorite.userId = :requesterUserId');
            }, 'favoriteId')
                .setParameter('type', FavoriteEntityType.USER)
                .setParameter('requesterUserId', requesterUserId);
        }

        this.logger.debug(
            `Fetching profile ${JSON.stringify({ targetUserId, requesterUserId })}`
        );

        const result = await qb.getRawAndEntities();

        const profile = result.entities[0];

        if (!profile) {
            throw new NotFoundException('Профиль не найден');
        }

        return {
            ...profile,
            favorites: {
                isFavorite: !!result.raw[0].favoriteId,
                favoriteId: result.raw[0].favoriteId,
                count: Number(result.raw[0].favoritesCount)
            }
        };
    }

    private getActiveTemporaryLocation(
        temporaryLocations: TemporaryLocation[]
    ) {
        const now = new Date();

        const active = temporaryLocations.find(loc => {
            const start = new Date(loc.startDate);
            const end = new Date(loc.endDate);

            return start <= now && now <= end;
        });

        return active ?? null;
    }

    getTemporaryLocationDto(location: TemporaryLocation) {
        return location
            ? {
                  id: location.id,
                  startDate: location.startDate,
                  endDate: location.endDate,
                  location: this.locationsService.getDto(location.location),
                  comment: location.comment
              }
            : null;
    }

    createProfileDto(profile: Profile) {
        const {
            firstName,
            lastName,
            avatarKey: avatar,
            isProfessional,
            isPro,
            createdAt
        } = profile.user;

        delete profile.user;

        const location = this.locationsService.getDto(profile.location);

        const activeTemporaryLocation = this.getTemporaryLocationDto(
            this.getActiveTemporaryLocation(profile.temporaryLocations)
        );

        const socials = profile.socials.map(s => ({
            ...s.social,
            value: s.value
        }));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const temporaryLocations = profile.temporaryLocations
            .filter(loc => new Date(loc.endDate) > today)
            .map(loc => this.getTemporaryLocationDto(loc));

        return {
            ...profile,
            firstName,
            lastName,
            avatar: avatar ? this.s3Service.getUrl(avatar) : null,
            isProfessional,
            isPro,
            createdAt,
            location,
            activeTemporaryLocation,
            socials,
            temporaryLocations
        };
    }

    async getProfileDtoByUserId({
        targetUserId,
        requesterUserId,
        manager
    }: {
        targetUserId: number;
        requesterUserId?: number;
        manager?: EntityManager;
    }) {
        const profile = await this.findProfileByUserId({
            targetUserId,
            requesterUserId,
            manager
        });
        return { profile: this.createProfileDto(profile) };
    }

    async updateProfile(userId: number, dto: ProfileRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const profilesRepo = manager.getRepository(Profile);
            const profileSocialsRepo = manager.getRepository(ProfileSocial);
            const temporaryLocationsRepo =
                manager.getRepository(TemporaryLocation);

            const profile = await this.findProfileByUserId({
                targetUserId: userId,
                manager
            });

            profile.status = dto.status;
            profile.price = dto.price;
            profile.conditions = dto.conditions;
            profile.equipment = dto.equipment;
            profile.geography = dto.geography;
            profile.languages = dto.languages;
            profile.about = dto.about;

            const locationIdsToDelete: number[] = [];

            if (dto.location) {
                const createdLocation = await this.locationsService.create(
                    dto.location
                );
                if (profile.location) {
                    profile.location.coordinates = createdLocation.coordinates;
                    profile.location.place = createdLocation.place;
                    profile.location.address = dto.location.address;
                } else {
                    profile.location = createdLocation;
                }
            } else {
                if (profile.location) {
                    locationIdsToDelete.push(profile.location.id);
                }
                profile.location = null;
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

            locationIdsToDelete.push(
                ...profile.temporaryLocations.map(loc => loc.location.id)
            );

            await this.locationsService.deleteByIds(
                locationIdsToDelete,
                manager
            );

            profile.temporaryLocations = await Promise.all(
                dto.temporaryLocations.map(async locDto =>
                    temporaryLocationsRepo.create({
                        profileId: profile.id,
                        startDate: new Date(locDto.startDate),
                        endDate: new Date(locDto.endDate),
                        location: await this.locationsService.create(
                            locDto.location
                        ),
                        comment: locDto.comment
                    })
                )
            );

            await profilesRepo.save(profile);

            return await this.getProfileDtoByUserId({
                targetUserId: userId,
                manager
            });
        });
    }

    async updateAvatar(userId: number, avatar: string) {
        const user = await this.findById(userId);

        await this.usersRepository.update(
            { id: userId },
            { avatarKey: avatar }
        );

        if (user.avatarKey && avatar != user.avatarKey) {
            await this.s3Service.deleteFile(user.avatarKey);
        }

        return await this.getUserMeDtoById(userId);
    }

    async deleteAvatar(userId: number) {
        const user = await this.findById(userId);

        await this.usersRepository.update({ id: userId }, { avatarKey: null });

        if (user.avatarKey) {
            await this.s3Service.deleteFile(user.avatarKey);
        }

        return await this.getUserMeDtoById(userId);
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

    async updateName(userId: number, dto: UpdateNameRequestDto) {
        await this.usersRepository.update(
            { id: userId },
            { firstName: dto.firstName, lastName: dto.lastName }
        );

        return await this.getUserMeDtoById(userId);
    }

    createUserBasicDto(user: User) {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarKey: user.avatarKey,
            avatarUrl: user.avatarKey
                ? this.s3Service.getUrl(user.avatarKey)
                : null,
            isPro: user.isPro,
            proCategories: user.profile.proCategories,
            specializations: user.profile.specializations,
            location: this.locationsService.getDto(user.profile.location),
            distance: user['distance'],
            favorites: {
                isFavorite: user.isFavorite,
                favoriteId: user.favoriteId,
                count: user.favoritesCount
            }
        };
    }

    private transformUsersRawData(entities: User[], raw: any[]) {
        // доп костыль, т.к. из-за джоинов категорий/специализаций происходит некорректный маппинг
        const rawMap = new Map();

        for (const r of raw) {
            rawMap.set(r.user_id, r);
        }

        return entities.map(user => {
            const r = rawMap.get(user.id);

            user.distance =
                typeof r?.distance === 'number'
                    ? Number((r.distance / 1000).toFixed(1))
                    : null;

            user.isFavorite = !!r?.favoriteId;
            user.favoriteId = r?.favoriteId;
            user.favoritesCount = Number(r?.favoritesCount ?? 0);

            return user;
        });
    }

    async findByIds(ids: number[], requesterUserId: number) {
        if (ids.length == 0) return [];

        const qb = this.usersRepository
            .createQueryBuilder('user')
            .where('user.id IN (:...ids)', { ids })
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('profile.location', 'location')
            .leftJoinAndSelect('location.place', 'locationPlace')
            .leftJoinAndSelect('profile.proCategories', 'proCategories')
            .leftJoinAndSelect('profile.specializations', 'specializations')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = user.id')
                    .andWhere('favorite.entityType = :type');
            }, 'favoritesCount')
            // как вариант вообще убрать, т.к. метод используется при запросе избранных
            .addSelect(subQuery => {
                return subQuery
                    .select('id')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = user.id')
                    .andWhere('favorite.entityType = :type')
                    .andWhere('favorite.userId = :requesterUserId');
            }, 'favoriteId')
            .setParameter('type', FavoriteEntityType.USER)
            .setParameter('requesterUserId', requesterUserId);

        const profile = await this.findProfileByUserId({
            targetUserId: requesterUserId
        });
        const activeTemporaryLocation = this.getActiveTemporaryLocation(
            profile.temporaryLocations
        );
        let latitude: number | null = null;
        let longitude: number | null = null;

        if (profile.location) {
            latitude = profile.location.coordinates.coordinates[1];
            longitude = profile.location.coordinates.coordinates[0];
        }

        if (activeTemporaryLocation) {
            latitude =
                activeTemporaryLocation.location.coordinates.coordinates[1];
            longitude =
                activeTemporaryLocation.location.coordinates.coordinates[0];
        }

        if (latitude != null && longitude != null) {
            // TODO: если активна временная локация, то нужно считать расстояние до неё
            qb.addSelect(
                `
                ST_Distance(
                    location.coordinates,
                    ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
                )
                `,
                'distance'
            ).setParameters({ longitude, latitude });
        }

        const { entities, raw } = await qb.getRawAndEntities();

        const users = this.transformUsersRawData(entities, raw);

        return users.map(u => this.createUserBasicDto(u));
    }

    async findProfessionals(
        {
            page,
            limit,
            latitude,
            longitude,
            order,
            radius,
            placeId,
            search,
            proCategoryId,
            specializationId
        }: UsersSearchQueryDto,
        requesterUserId?: number
    ) {
        const qb = this.usersRepository
            .createQueryBuilder('user')
            .where('user.isProfessional = :isProfessional', {
                isProfessional: true
            })
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('profile.location', 'location')
            .leftJoinAndSelect('location.place', 'locationPlace')
            .leftJoinAndSelect('profile.proCategories', 'proCategories')
            .leftJoinAndSelect('profile.specializations', 'specializations')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = user.id')
                    .andWhere('favorite.entityType = :type');
            }, 'favoritesCount')
            .setParameter('type', FavoriteEntityType.USER)
            .take(limit)
            .skip((page - 1) * limit);

        if (requesterUserId != undefined) {
            qb.addSelect(subQuery => {
                return subQuery
                    .select('id')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = user.id')
                    .andWhere('favorite.entityType = :type')
                    .andWhere('favorite.userId = :requesterUserId');
            }, 'favoriteId').setParameter('requesterUserId', requesterUserId);
        }

        if (latitude != undefined && longitude != undefined) {
            // TODO: если активна временная локация, то нужно считать расстояние до неё
            qb.addSelect(
                `
                ST_Distance(
                    location.coordinates,
                    ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
                )
                `,
                'distance'
            ).setParameters({ longitude, latitude });

            if (order == 'distance') {
                qb.orderBy('distance', 'ASC');
            }

            if (radius != undefined) {
                qb.andWhere(
                    `
                        ST_Distance(
                            location.coordinates,
                            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
                        ) <= :radius
                    `,
                    { radius: radius * 1000 }
                );
            }
        }

        if (placeId) {
            qb.andWhere('locationPlace.id = :placeId', { placeId });
        }

        if (search) {
            qb.andWhere(
                `(user.firstName ILIKE :search OR user.lastName ILIKE :search)`,
                { search: `%${search}%` }
            );
        }

        if (proCategoryId != undefined) {
            qb.andWhere(qb2 => {
                const subQuery = qb2
                    .subQuery()
                    .select('1')
                    .from('pro_categories_profiles', 'pcp')
                    .where('pcp.profile_id = profile.id')
                    .andWhere('pcp.pro_category_id = :proCategoryId')
                    .getQuery();

                return `EXISTS ${subQuery}`;
            }).setParameter('proCategoryId', proCategoryId);
        }

        if (specializationId != undefined) {
            qb.andWhere(qb2 => {
                const subQuery = qb2
                    .subQuery()
                    .select('1')
                    .from('specializations_profiles', 'sp')
                    .where('sp.profile_id = profile.id')
                    .andWhere('sp.specialization_id = :specializationId')
                    .getQuery();

                return `EXISTS ${subQuery}`;
            }).setParameter('specializationId', specializationId);
        }

        const { entities, raw } = await qb.getRawAndEntities();

        const total = await qb.getCount();

        const users = this.transformUsersRawData(entities, raw);

        const dtos = users.map(u => this.createUserBasicDto(u));

        return new PaginationDto(dtos, total, page, limit);
    }

    async exists(id: number) {
        const count = await this.usersRepository.count({ where: { id } });
        return count > 0;
    }
}
