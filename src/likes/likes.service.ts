import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { FilmingLocationsService } from '@filming-locations/filming-locations.service';
import { PhotosService } from '@photos/photos.service';
import { EntityActionRequestDto } from '@shared/dto/entity-action-request.dto';
import { EntityType } from '@shared/enums/entity-type.enums';
import { UsersService } from '@users/users.service';

import { Like } from './like.entity';

@Injectable()
export class LikesService {
    constructor(
        @InjectRepository(Like)
        private readonly likesRepository: Repository<Like>,
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

    async addLike(userId: number, dto: EntityActionRequestDto) {
        const validator = this.validators[dto.entityType];
        if (!validator)
            throw new BadRequestException('Некорректный тип сущности');

        const exists = await validator(dto.entityId);
        if (!exists) throw new NotFoundException('Сущность не найдена');

        try {
            await this.likesRepository.save({
                userId,
                entityType: dto.entityType,
                entityId: dto.entityId
            });
            return true;
        } catch (error) {
            const errorCode = (error as { code?: string }).code;
            if (errorCode === '23505') {
                throw new BadRequestException('Сущность уже поставлен лайк');
            }
            throw error;
        }
    }

    async removeLike(userId: number, id: number) {
        const like = await this.likesRepository.findOne({
            where: { id, userId }
        });

        if (!like) {
            throw new NotFoundException('Лайк не найден');
        }

        await this.likesRepository.remove(like);
    }

    async validateByIdsAndUserId(ids: number[], userId: number) {
        ids = [...new Set(ids)];

        const likes = await this.likesRepository.find({
            select: { id: true },
            where: { id: In(ids), userId }
        });

        if (ids.length != likes.length) {
            throw new NotFoundException('Избранное не найдено');
        }
    }

    async bulkRemove(userId: number, ids: number[]) {
        await this.validateByIdsAndUserId(ids, userId);

        await this.likesRepository.delete({
            id: In(ids)
        });
    }
}
