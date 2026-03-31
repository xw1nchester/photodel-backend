import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { AlbumsService } from '@albums/albums.service';
import { FilmingLocationsService } from '@filming-locations/filming-locations.service';
import { PhotosService } from '@photos/photos.service';
import { EntityActionQueryDto } from '@shared/dto/entity-action-query.dto';
import { EntityActionRequestDto } from '@shared/dto/entity-action-request.dto';
import { PaginationDto } from '@shared/dto/pagination.dto';
import { UsersService } from '@users/users.service';

import { Favorite } from './favorite.entity';
import { EntityType } from '@shared/enums/entity-type.enums';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite)
        private readonly favoriteRepository: Repository<Favorite>,
        private readonly usersService: UsersService,
        private readonly albumsService: AlbumsService,
        private readonly photosService: PhotosService,
        private readonly filmingLocationsService: FilmingLocationsService
    ) {}

    private validators = {
        [EntityType.USER]: (id: number) => this.usersService.exists(id),

        [EntityType.PHOTO]: (id: number) =>
            this.photosService.exists(id),

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

    async addFavorite(userId: number, dto: EntityActionRequestDto) {
        const validator = this.validators[dto.entityType];
        if (!validator)
            throw new BadRequestException('Некорректный тип сущности');

        const exists = await validator(dto.entityId);
        if (!exists) throw new NotFoundException('Сущность не найдена');

        try {
            await this.favoriteRepository.save({
                userId,
                entityType: dto.entityType,
                entityId: dto.entityId
            });
            return true;
        } catch (error) {
            const errorCode = (error as { code?: string }).code;
            if (errorCode === '23505') {
                throw new BadRequestException(
                    'Сущность уже добавлена в избранное'
                );
            }
            throw error;
        }
    }

    async removeFavorite(userId: number, id: number) {
        const favorite = await this.favoriteRepository.findOne({
            where: { id, userId }
        });

        if (!favorite) {
            throw new NotFoundException('Избранное не найдено');
        }

        await this.favoriteRepository.remove(favorite);
    }

    async getFavorites(
        userId: number,
        { type, limit, page }: EntityActionQueryDto
    ) {
        const loader = this.loaders[type];
        if (!loader) throw new BadRequestException('Некорректный тип сущности');

        const [favsData, total] = await this.favoriteRepository.findAndCount({
            select: { entityId: true },
            where: { userId, entityType: type },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: (page - 1) * limit
        });

        const ids = favsData.map(f => f.entityId);

        const entities = await loader(ids, userId);

        // попробовать решить без костыля с as
        const map = new Map(entities.map(e => [e.id, e]) as [number, any][]);

        const ordered = ids.map(id => map.get(id)).filter(Boolean);

        return new PaginationDto(ordered, total, page, limit);
    }

    async validateByIdsAndUserId(ids: number[], userId: number) {
        ids = [...new Set(ids)];

        const favorites = await this.favoriteRepository.find({
            select: { id: true },
            where: { id: In(ids), userId }
        });

        if (ids.length != favorites.length) {
            throw new NotFoundException('Избранное не найдено');
        }
    }

    async bulkRemove(userId: number, ids: number[]) {
        await this.validateByIdsAndUserId(ids, userId);

        await this.favoriteRepository.delete({
            id: In(ids)
        });
    }
}
