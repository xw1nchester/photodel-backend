import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AlbumsService } from '@albums/albums.service';
import { PhotosService } from '@photos/photos.service';
import { PaginationDto } from '@shared/dto/pagination.dto';
import { UsersService } from '@users/users.service';

import { FavoriteQueryDto } from './dto/favorite-query.dto';
import { FavoriteRequestDto } from './dto/favorite-request.dto';
import { FavoriteEntityType } from './enums';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite)
        private readonly favoriteRepository: Repository<Favorite>,
        private readonly usersService: UsersService,
        private readonly albumsService: AlbumsService,
        private readonly photosService: PhotosService
    ) {}

    private validators = {
        [FavoriteEntityType.USER]: (id: number) => this.usersService.exists(id),

        [FavoriteEntityType.ALBUM]: (id: number) =>
            this.albumsService.exists(id),

        [FavoriteEntityType.PHOTO]: (id: number) =>
            this.photosService.exists(id)
    };

    private loaders = {
        // FavoriteEntityType.USER

        [FavoriteEntityType.ALBUM]: (ids: number[], requesterUserId: number) =>
            this.albumsService.findByIds(ids, requesterUserId),

        [FavoriteEntityType.PHOTO]: (ids: number[], requesterUserId: number) =>
            this.photosService.findByIds(ids, requesterUserId)
    };

    async addFavorite(userId: number, dto: FavoriteRequestDto) {
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
        { type, limit, page }: FavoriteQueryDto
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

        const map = new Map(entities.map(e => [e.id, e]));

        const ordered = ids.map(id => map.get(id)).filter(Boolean);

        return new PaginationDto(ordered, total, page, limit);
    }
}
