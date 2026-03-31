import { FilesService } from '@files/files.service';
import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Review } from './review.entity';
import { EntityType } from '@shared/enums/entity-type.enums';
import { UsersService } from '@users/users.service';
import { PhotosService } from '@photos/photos.service';
import { FilmingLocationsService } from '@filming-locations/filming-locations.service';
import { ReviewRequestDto } from './dto/review-request.dto';

@Injectable()
export class ReviewsService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Review)
        private readonly reviewsRepository: Repository<Review>,
        private readonly filesService: FilesService,
        private readonly usersService: UsersService,
        private readonly photosService: PhotosService,
        private readonly filmingLocationsService: FilmingLocationsService
    ) {}

    private validators = {
        [EntityType.USER]: (id: number) => this.usersService.exists(id),

        [EntityType.PHOTO]: (id: number) => this.photosService.exists(id),

        [EntityType.PLACE]: (id: number) =>
            this.filmingLocationsService.exists(id)
    };

    private loaders = {
        [EntityType.USER]: (ids: number[], requesterUserId: number) =>
            this.usersService.findByIds(ids, requesterUserId),

        [EntityType.PHOTO]: (ids: number[], requesterUserId: number) =>
            this.photosService.findByIds(ids, requesterUserId),

        [EntityType.PLACE]: (ids: number[], requesterUserId: number) =>
            this.filmingLocationsService.findByIds(ids, requesterUserId)
    };

    createDto(review: Review) {
        const photos = review.files.map(f => ({
            id: f.id,
            key: f.key,
            // TODO: опеределиться, использовать метод filesService или s3 в таких случаях
            url: this.filesService.getUrl(f.key)
        }));

        const user = {
            id: review.user.id,
            firstName: review.user.firstName,
            lastName: review.user.lastName,
            avatarKey: review.user.avatarKey,
            avatarUrl: review.user.avatarKey
                ? this.filesService.getUrl(review.user.avatarKey)
                : null,
            isPro: review.user.isPro
        };

        return {
            id: review.id,
            content: review.content,
            rating: review.rating,
            isPublished: review.isPublished,
            photos,
            user,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
        }
    }

    async getDtoById({ id, manager }: { id: number; manager?: EntityManager }) {
        const repo = manager
            ? manager.getRepository(Review)
            : this.reviewsRepository;

        const review = await repo.findOne({
            where: { id },
            relations: {
                user: true,
                files: true
            }
        });

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
                manager
            });
        });
    }
}
