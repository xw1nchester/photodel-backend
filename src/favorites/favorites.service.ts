import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PhotosService } from '@photos/photos.service';
import { UsersService } from '@users/users.service';

import { FavoriteRequestDto } from './dto/favorite-request.dto';
import { FavoriteEntityType } from './enums';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite)
        private readonly favoriteRepository: Repository<Favorite>,
        private readonly usersService: UsersService,
        private readonly photosService: PhotosService
    ) {}

    private validators = {
        [FavoriteEntityType.USER]: (id: number) => this.usersService.exists(id),

        [FavoriteEntityType.PHOTO]: (id: number) =>
            this.photosService.exists(id)
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

    async getFavorites(userId: number) {
        return await this.favoriteRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' }
        });
    }
}
