import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, EntityManager, Repository } from 'typeorm';

import { FilesService } from '@files/files.service';
import { FilmingLocationsService } from '@filming-locations/filming-locations.service';
import { PhotoSessionsService } from '@photo-sessions/photo-sessions.service';
import { Photo } from '@photos/photo.entity';
import { PhotosService } from '@photos/photos.service';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginationDto } from '@shared/dto/pagination.dto';
import { EntityType } from '@shared/enums/entity-type.enums';
import { createUserDto } from '@shared/mappers/user.mapper';
import { TrainingsService } from '@trainings/trainings.service';
import { User } from '@users/entities/user.entity';
import { UsersService } from '@users/users.service';

import { ReviewRequestDto } from './dto/review-request.dto';
import { Review } from './review.entity';

@Injectable()
export class ReviewsService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Review)
        private readonly reviewsRepository: Repository<Review>,
        private readonly filesService: FilesService,
        private readonly usersService: UsersService,
        private readonly photosService: PhotosService,
        private readonly filmingLocationsService: FilmingLocationsService,
        private readonly photoSessionsService: PhotoSessionsService,
        private readonly trainingsService: TrainingsService
    ) {}

    private validators = {
        [EntityType.USER]: (id: number) => this.usersService.exists(id),

        [EntityType.PHOTO]: (id: number) => this.photosService.exists(id),

        [EntityType.PLACE]: (id: number) =>
            this.filmingLocationsService.exists(id),

        [EntityType.PHOTO_SESSION]: (id: number) =>
            this.photoSessionsService.exists(id),

        [EntityType.TRAINING]: (id: number) => this.trainingsService.exists(id)
    };

    createDto(review: Review) {
        const photos = review.files.map(f => ({
            id: f.id,
            key: f.key,
            url: this.filesService.getUrl(f.key)
        }));

        const avatarUrl = review.user.avatarKey
            ? this.filesService.getUrl(review.user.avatarKey)
            : null;

        const user = createUserDto(review.user, avatarUrl);

        let entity = null;

        if (review.entity) {
            if (review.entityType == EntityType.USER) {
                entity = {
                    id: review.entity.id,
                    firstName: review.entity.firstName,
                    lastName: review.entity.lastName,
                    avatarKey: review.entity.avatarKey,
                    avatarUrl: review.entity.avatarKey
                        ? this.filesService.getUrl(review.entity.avatarKey)
                        : null,
                    isPro: review.entity.isPro
                };
            }

            if (review.entityType == EntityType.PHOTO) {
                entity = {
                    id: review.entity.id,
                    name: review.entity.name
                };
            }
        }

        return {
            id: review.id,
            entityType: review.entityType,
            entityId: review.entityId,
            entity,
            content: review.content,
            rating: review.rating,
            isPublished: review.isPublished,
            photos,
            user,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
        };
    }

    async getDtoById({
        id,
        requesterUserId,
        manager
    }: {
        id: number;
        requesterUserId?: number;
        manager?: EntityManager;
    }) {
        const repo = manager
            ? manager.getRepository(Review)
            : this.reviewsRepository;

        const query = repo
            .createQueryBuilder('review')
            .where('review.id = :id', { id })
            .leftJoinAndSelect('review.user', 'user')
            .leftJoinAndSelect('review.files', 'files')
            .leftJoinAndMapOne(
                'review.entity',
                User,
                'entity',
                'review.entityType = :userEntityType AND review.entityId = entity.id',
                { userEntityType: EntityType.USER }
            );

        if (requesterUserId != undefined) {
            query.andWhere(
                new Brackets(qb => {
                    qb.where('review.userId = :requesterUserId', {
                        requesterUserId
                    }).orWhere('review.isPublished = :isPublished', {
                        isPublished: true
                    });
                })
            );
        } else {
            query.andWhere('review.isPublished = :isPublished', {
                isPublished: true
            });
        }

        const review = await query.getOne();

        if (!review) {
            throw new NotFoundException('Отзыв не найден');
        }

        return { review: this.createDto(review) };
    }

    async create(userId: number, dto: ReviewRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(Review);

            const validator = this.validators[dto.entityType];
            if (!validator)
                throw new BadRequestException('Некорректный тип сущности');

            const exists = await validator(dto.entityId);
            if (!exists) throw new NotFoundException('Сущность не найдена');

            if (dto.entityType == EntityType.USER) {
                if (dto.entityId == userId) {
                    throw new BadRequestException(
                        'Нельзя оставлять отзывы самому себе'
                    );
                }

                const count = await this.reviewsRepository.count({
                    where: {
                        entityType: EntityType.USER,
                        entityId: dto.entityId,
                        userId
                    }
                });

                if (count > 0) {
                    throw new BadRequestException(
                        'Отзыв о пользователе уже оставлен'
                    );
                }
            }

            const files = await this.filesService.findAndvalidateByIdsAndUserId(
                dto.photoIds,
                userId,
                manager
            );

            const createdReview = await repo.save({
                userId,
                entityType: dto.entityType,
                entityId: dto.entityId,
                content: dto.content,
                rating: dto.rating,
                // TODO: в дальнейшем false
                isPublished: true,
                files
            });

            return await this.getDtoById({
                id: createdReview.id,
                requesterUserId: userId,
                manager
            });
        });
    }

    async findAll({
        entityType,
        pagination,
        requesterUserId,
        entityId,
        my
    }: {
        entityType: EntityType;
        pagination: PaginationQueryDto;
        requesterUserId?: number;
        entityId?: number;
        my?: boolean;
    }) {
        const { page, limit } = pagination;

        const query = this.reviewsRepository
            .createQueryBuilder('review')
            .where('review.entityType = :entityType', { entityType })
            .leftJoinAndSelect('review.user', 'user')
            .andWhere('user.isBlocked = false')
            .leftJoinAndSelect('review.files', 'files')
            .orderBy('review.createdAt', 'DESC')
            .take(limit)
            .skip((page - 1) * limit);

        if (entityType == EntityType.USER) {
            query.leftJoinAndMapOne(
                'review.entity',
                User,
                'entity',
                'review.entityType = :userEntityType AND review.entityId = entity.id',
                { userEntityType: EntityType.USER }
            );
        }

        if (entityType == EntityType.PHOTO) {
            query.leftJoinAndMapOne(
                'review.entity',
                Photo,
                'entity',
                'review.entityType = :photoEntityType AND review.entityId = entity.id',
                { photoEntityType: EntityType.PHOTO }
            );
        }

        if (requesterUserId != undefined) {
            query.andWhere(
                new Brackets(qb => {
                    qb.where('review.userId = :requesterUserId', {
                        requesterUserId
                    }).orWhere('review.isPublished = :isPublished', {
                        isPublished: true
                    });
                })
            );
        } else {
            query.andWhere('review.isPublished = :isPublished', {
                isPublished: true
            });
        }

        if (my && requesterUserId != undefined) {
            query.andWhere('review.userId = :requesterUserId', {
                requesterUserId
            });
        }

        if (entityId != undefined) {
            query.andWhere('review.entityId = :entityId', { entityId });
        }

        const [reviews, total] = await query.getManyAndCount();

        const dtos = reviews.map(r => this.createDto(r));

        return new PaginationDto(dtos, total, page, limit);
    }

    async findByIdAndUserId(
        id: number,
        userId: number,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(Review)
            : this.reviewsRepository;

        const review = await repo.findOne({
            where: { id, userId },
            relations: { user: true, files: true }
        });

        if (!review) {
            throw new NotFoundException('Отзыв не найден');
        }

        return review;
    }

    async update(id: number, userId: number, dto: ReviewRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(Review);

            const validator = this.validators[dto.entityType];
            if (!validator)
                throw new BadRequestException('Некорректный тип сущности');

            const exists = await validator(dto.entityId);
            if (!exists) throw new NotFoundException('Сущность не найдена');

            const review = await this.findByIdAndUserId(id, userId, manager);

            review.files =
                await this.filesService.findAndvalidateByIdsAndUserId(
                    dto.photoIds,
                    userId,
                    manager
                );

            review.entityType = dto.entityType;
            review.entityId = dto.entityId;
            review.content = dto.content;
            review.rating = dto.rating;
            // TODO: в дальнейшем false
            review.isPublished = true;

            await repo.save(review);

            return await this.getDtoById({
                id,
                requesterUserId: userId,
                manager
            });
        });
    }

    async remove(id: number, userId: number) {
        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(Review);

            const review = await this.findByIdAndUserId(id, userId, manager);

            await repo.remove(review);

            return { review: this.createDto(review) };
        });
    }
}
