import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, EntityManager, In, Repository } from 'typeorm';

import { Favorite } from '@favorites/favorite.entity';
import { FilesService } from '@files/files.service';
import { Like } from '@likes/like.entity';
import { Location } from '@locations/entities/location.entity';
import { LocationsService } from '@locations/locations.service';
import { Review } from '@reviews/review.entity';
import { FilterQueryDto } from '@shared/dto/filter-query.dto';
import { PaginationDto } from '@shared/dto/pagination.dto';
import { EntityType } from '@shared/enums/entity-type.enums';
import { SortOption } from '@shared/enums/sort-option.enum';
import { createUserDto } from '@shared/mappers/user.mapper';
import { TeamsService } from '@teams/teams.service';

import { TrainingRequestDto } from './dto/training-request.dto';
import { Training } from './training.entity';

@Injectable()
export class TrainingsService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Training)
        private readonly trainingsRepository: Repository<Training>,
        private readonly filesService: FilesService,
        private readonly locationsService: LocationsService,
        private readonly teamsService: TeamsService
    ) {}

    createDto(training: Training) {
        const photos = training.files.map(f =>
            this.filesService.createBasicDto(f)
        );

        const avatarUrl = training.user.avatarKey
            ? this.filesService.getUrl(training.user.avatarKey)
            : null;

        const user = createUserDto(training.user, avatarUrl);

        const team = training.team.map(user => {
            const avatarUrl = user.avatarKey
                ? this.filesService.getUrl(user.avatarKey)
                : null;

            const proCategories = user.profile.proCategories;

            return { ...createUserDto(user, avatarUrl), proCategories };
        });

        const organizers = training.organizers.map(user => {
            const avatarUrl = user.avatarKey
                ? this.filesService.getUrl(user.avatarKey)
                : null;

            return createUserDto(user, avatarUrl);
        });

        return {
            id: training.id,
            photos,
            name: training.name,
            description: training.description,
            location: this.locationsService.createDto(training.location),
            type: training.type,
            format: training.format,
            startDate: training.startDate,
            endDate: training.endDate,
            price: training.price,
            prepayment: training.prepayment,
            maxParticipants: training.maxParticipants,
            isPublished: training.isPublished,
            team,
            organizers,
            createdAt: training.createdAt,
            updatedAt: training.updatedAt,
            user,
            favorites: {
                isFavorite: training.isFavorite,
                favoriteId: training.favoriteId,
                count: training.favoritesCount
            },
            likes: {
                isLiked: training.isLiked,
                likeId: training.likeId,
                count: training.likesCount
            },
            reviews: {
                count: training.reviewsCount
            }
        };
    }

    private transformRawData(entities: Training[], raw: any[]) {
        return entities.map((fl, index) => {
            fl.isFavorite = !!raw[index].favoriteId;
            fl.favoriteId = raw[index].favoriteId;
            fl.favoritesCount = Number(raw[index].favoritesCount);

            fl.isLiked = !!raw[index].likeId;
            fl.likeId = raw[index].likeId;
            fl.likesCount = Number(raw[index].likes_count);

            fl.reviewsCount = Number(raw[index].reviewsCount);

            return fl;
        });
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
            ? manager.getRepository(Training)
            : this.trainingsRepository;

        const query = repo
            .createQueryBuilder('training')
            .where('training.id = :id', { id })
            .leftJoinAndSelect('training.files', 'files')
            .leftJoinAndSelect('training.location', 'location')
            .leftJoinAndSelect('location.place', 'locationPlace')
            .leftJoinAndSelect('training.user', 'user')
            .leftJoinAndSelect('training.team', 'team')
            .leftJoinAndSelect('team.profile', 'teamProfile')
            .leftJoinAndSelect(
                'teamProfile.proCategories',
                'organizerProfileProCategories'
            )
            .leftJoinAndSelect('training.organizers', 'organizer')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = training.id')
                    .andWhere('favorite.entityType = :favoriteEntityType');
            }, 'favoritesCount')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Like, 'like')
                    .where('like.entityId = training.id')
                    .andWhere('like.entityType = :likeEntityType');
            }, 'likes_count')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Review, 'review')
                    .where('review.entityId = training.id')
                    .andWhere('review.entityType = :reviewEntityType')
                    .andWhere('review.isPublished = :reviewIsPublished');
            }, 'reviewsCount')
            .setParameter('favoriteEntityType', EntityType.TRAINING)
            .setParameter('likeEntityType', EntityType.TRAINING)
            .setParameter('reviewEntityType', EntityType.TRAINING)
            .setParameter('reviewIsPublished', true);

        if (requesterUserId != undefined) {
            query
                .andWhere(
                    new Brackets(qb => {
                        qb.where('training.userId = :requesterUserId', {
                            requesterUserId
                        }).orWhere('training.isPublished = :isPublished', {
                            isPublished: true
                        });
                    })
                )
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Favorite, 'favorite')
                        .where('favorite.entityId = training.id')
                        .andWhere('favorite.entityType = :favoriteEntityType')
                        .andWhere('favorite.userId = :requesterUserId');
                }, 'favoriteId')
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Like, 'like')
                        .where('like.entityId = training.id')
                        .andWhere('like.entityType = :likeEntityType')
                        .andWhere('like.userId = :requesterUserId');
                }, 'likeId')
                .setParameter('requesterUserId', requesterUserId);
        } else {
            query.andWhere('training.isPublished = :isPublished', {
                isPublished: true
            });
        }

        const { entities, raw } = await query.getRawAndEntities();

        const training = this.transformRawData(entities, raw)[0];

        if (!training) {
            throw new NotFoundException('Обучение не найдено');
        }

        return { training: this.createDto(training) };
    }

    async create(userId: number, dto: TrainingRequestDto) {
        if (
            new Date(dto.startDate) > new Date(dto.endDate) ||
            new Date(dto.endDate) < new Date()
        ) {
            throw new BadRequestException('Некорректные даты');
        }

        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(Training);

            const files = await this.filesService.findAndvalidateByIdsAndUserId(
                dto.photoIds,
                userId,
                manager
            );

            await this.teamsService.validateTeamMembers(
                userId,
                dto.team.concat(dto.organizers)
            );

            let location: Location | null = null;
            if (dto.location) {
                location = await this.locationsService.create(
                    dto.location,
                    manager
                );
            }

            const createdTraining = await repo.save({
                previewFileId: dto.photoIds[0],
                name: dto.name,
                description: dto.description,
                type: dto.type,
                format: dto.format,
                startDate: dto.startDate,
                endDate: dto.endDate,
                price: dto.price,
                prepayment: dto.prepayment,
                maxParticipants: dto.maxParticipants,
                isPublished: dto.isPublished,
                files,
                team: dto.team.map(m => ({
                    id: m
                })),
                organizers: dto.organizers.map(o => ({
                    id: o
                })),
                location,
                userId
            });

            return await this.getDtoById({
                id: createdTraining.id,
                requesterUserId: userId,
                manager
            });
        });
    }

    createBasicDto(training: Training) {
        const avatarUrl = training.user.avatarKey
            ? this.filesService.getUrl(training.user.avatarKey)
            : null;

        const user = createUserDto(training.user, avatarUrl);

        return {
            id: training.id,
            preview: this.filesService.createBasicDto(training.previewFile),
            name: training.name,
            location: this.locationsService.createDto(training.location),
            format: training.format,
            startDate: training.startDate,
            endDate: training.endDate,
            price: training.price,
            user,
            favorites: {
                isFavorite: training.isFavorite,
                favoriteId: training.favoriteId,
                count: training.favoritesCount
            },
            likes: {
                isLiked: training.isLiked,
                likeId: training.likeId,
                count: training.likesCount
            },
            reviews: {
                count: training.reviewsCount
            }
        };
    }

    async findAll(
        { page, limit, sort, userId: targetUserId, my, search }: FilterQueryDto,
        requesterUserId?: number
    ) {
        const query = this.trainingsRepository
            .createQueryBuilder('training')
            .leftJoinAndSelect('training.previewFile', 'previewFile')
            .leftJoinAndSelect('training.location', 'location')
            .leftJoinAndSelect('location.place', 'locationPlace')
            .leftJoinAndSelect('training.user', 'user')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = training.id')
                    .andWhere('favorite.entityType = :favoriteEntityType');
            }, 'favoritesCount')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Like, 'like')
                    .where('like.entityId = training.id')
                    .andWhere('like.entityType = :likeEntityType');
            }, 'likes_count')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Review, 'review')
                    .where('review.entityId = training.id')
                    .andWhere('review.entityType = :reviewEntityType')
                    .andWhere('review.isPublished = :reviewIsPublished');
            }, 'reviewsCount')
            .setParameter('favoriteEntityType', EntityType.TRAINING)
            .setParameter('likeEntityType', EntityType.TRAINING)
            .setParameter('reviewEntityType', EntityType.TRAINING)
            .setParameter('reviewIsPublished', true)
            .take(limit)
            .skip((page - 1) * limit);

        switch (sort) {
            case SortOption.NEWEST:
                query.orderBy('training.createdAt', 'DESC');
                break;

            case SortOption.POPULARITY:
                query.orderBy(`likes_count`, 'DESC');
                break;

            default:
                query.orderBy('training.createdAt', 'DESC');
                break;
        }

        if (requesterUserId != undefined) {
            query
                .andWhere(
                    new Brackets(qb => {
                        qb.where('training.userId = :requesterUserId', {
                            requesterUserId
                        }).orWhere('training.isPublished = :isPublished', {
                            isPublished: true
                        });
                    })
                )
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Favorite, 'favorite')
                        .where('favorite.entityId = training.id')
                        .andWhere('favorite.entityType = :favoriteEntityType')
                        .andWhere('favorite.userId = :requesterUserId');
                }, 'favoriteId')
                .addSelect(subQuery => {
                    return subQuery
                        .select('id')
                        .from(Like, 'like')
                        .where('like.entityId = training.id')
                        .andWhere('like.entityType = :likeEntityType')
                        .andWhere('like.userId = :requesterUserId');
                }, 'likeId')
                .setParameter('requesterUserId', requesterUserId);
        } else {
            query.andWhere('training.isPublished = :isPublished', {
                isPublished: true
            });
        }

        if (my && requesterUserId != undefined) {
            query.andWhere('training.userId = :requesterUserId', {
                requesterUserId
            });
        }

        if (targetUserId != undefined) {
            query.andWhere('training.userId = :targetUserId', {
                targetUserId
            });
        }

        if (search) {
            query.andWhere(`training.name ILIKE :search)`, {
                search: `%${search}%`
            });
        }

        const { entities, raw } = await query.getRawAndEntities();

        const total = await query.getCount();

        const trainings = this.transformRawData(entities, raw);

        const dtos = trainings.map(fl => this.createBasicDto(fl));

        return new PaginationDto(dtos, total, page, limit);
    }

    async findByIdAndUserId(
        id: number,
        userId: number,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(Training)
            : this.trainingsRepository;

        const training = await repo.findOne({
            where: { id, userId },
            relations: {
                files: true,
                location: true,
                user: true,
                team: {
                    profile: {
                        proCategories: true
                    }
                },
                organizers: true
            }
        });

        if (!training) {
            throw new NotFoundException('Обучение не найдено');
        }

        return training;
    }

    async validateByIdsAndUserId(
        ids: number[],
        userId: number,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(Training)
            : this.trainingsRepository;

        ids = [...new Set(ids)];

        const trainings = await repo.find({
            where: { id: In(ids), userId }
        });

        if (ids.length != trainings.length) {
            throw new NotFoundException('Обучение не найдено');
        }
    }

    async update(id: number, userId: number, dto: TrainingRequestDto) {
        if (
            new Date(dto.startDate) > new Date(dto.endDate) ||
            new Date(dto.endDate) < new Date()
        ) {
            throw new BadRequestException('Некорректные даты');
        }

        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(Training);

            const training = await this.findByIdAndUserId(id, userId, manager);

            training.files =
                await this.filesService.findAndvalidateByIdsAndUserId(
                    dto.photoIds,
                    userId,
                    manager
                );

            await this.teamsService.validateTeamMembers(
                userId,
                dto.team.concat(dto.organizers)
            );

            training.previewFileId = dto.photoIds[0];
            training.name = dto.name;
            training.description = dto.description;
            training.type = dto.type;
            training.format = dto.format;
            training.startDate = new Date(dto.startDate);
            training.endDate = new Date(dto.endDate);
            training.price = dto.price;
            training.prepayment = dto.prepayment;
            training.maxParticipants = dto.maxParticipants;
            training.isPublished = dto.isPublished;

            if (dto.location) {
                const createdLocation = await this.locationsService.create(
                    dto.location,
                    manager
                );
                if (training.location) {
                    training.location.coordinates = createdLocation.coordinates;
                    training.location.place = createdLocation.place;
                    training.location.address = dto.location.address;
                } else {
                    training.location = createdLocation;
                }
            } else {
                if (training.location) {
                    await this.locationsService.deleteByIds(
                        training.location.id,
                        manager
                    );
                }
                training.location = null;
            }

            await repo.save({
                ...training,
                team: dto.team.map(m => ({
                    id: m
                })),
                organizers: dto.organizers.map(o => ({
                    id: o
                }))
            });

            return await this.getDtoById({
                id,
                requesterUserId: userId,
                manager
            });
        });
    }

    async remove(id: number, userId: number) {
        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(Training);

            const training = await this.findByIdAndUserId(id, userId, manager);

            await repo.remove(training);

            return { training: this.createDto(training) };
        });
    }

    async bulkRemove(userId: number, ids: number[]) {
        await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(Training);

            await this.validateByIdsAndUserId(ids, userId, manager);

            await repo.delete({
                id: In(ids)
            });
        });
    }

    async exists(id: number) {
        const count = await this.trainingsRepository.count({
            where: { id }
        });
        return count > 0;
    }

    async findByIds(
        ids: number[],
        requesterUserId: number,
        manager?: EntityManager
    ) {
        if (ids.length == 0) return [];

        const repo = manager
            ? manager.getRepository(Training)
            : this.trainingsRepository;

        const query = repo
            .createQueryBuilder('training')
            .where('training.id IN (:...ids)', { ids })
            .leftJoinAndSelect('training.previewFile', 'previewFile')
            .leftJoinAndSelect('training.location', 'location')
            .leftJoinAndSelect('location.place', 'locationPlace')
            .leftJoinAndSelect('training.user', 'user')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = training.id')
                    .andWhere('favorite.entityType = :favoriteEntityType');
            }, 'favoritesCount')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Like, 'like')
                    .where('like.entityId = training.id')
                    .andWhere('like.entityType = :likeEntityType');
            }, 'likes_count')
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(*)')
                    .from(Review, 'review')
                    .where('review.entityId = training.id')
                    .andWhere('review.entityType = :reviewEntityType')
                    .andWhere('review.isPublished = :reviewIsPublished');
            }, 'reviewsCount')
            .addSelect(subQuery => {
                return subQuery
                    .select('id')
                    .from(Favorite, 'favorite')
                    .where('favorite.entityId = training.id')
                    .andWhere('favorite.entityType = :favoriteEntityType')
                    .andWhere('favorite.userId = :requesterUserId');
            }, 'favoriteId')
            .addSelect(subQuery => {
                return subQuery
                    .select('id')
                    .from(Like, 'like')
                    .where('like.entityId = training.id')
                    .andWhere('like.entityType = :likeEntityType')
                    .andWhere('like.userId = :requesterUserId');
            }, 'likeId')
            .setParameter('favoriteEntityType', EntityType.TRAINING)
            .setParameter('likeEntityType', EntityType.TRAINING)
            .setParameter('reviewEntityType', EntityType.TRAINING)
            .setParameter('reviewIsPublished', true)
            .setParameter('requesterUserId', requesterUserId);

        const { entities, raw } = await query.getRawAndEntities();

        const trainings = this.transformRawData(entities, raw);

        return trainings.map(fl => this.createBasicDto(fl));
    }
}
