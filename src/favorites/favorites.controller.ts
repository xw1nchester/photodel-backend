import {
    Controller,
    Delete,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    HttpStatus,
    HttpCode
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';

import { FavoriteRequestDto } from './dto/favorite-request.dto';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@Controller('favorites')
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @ApiOkResponse({ type: Boolean })
    async addFavorite(
        @CurrentUser() user: JwtPayload,
        @Body() dto: FavoriteRequestDto
    ) {
        await this.favoritesService.addFavorite(user.id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiOkResponse()
    async removeFavorite(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number
    ) {
        await this.favoritesService.removeFavorite(user.id, id);
    }

    @Get()
    @ApiBearerAuth()
    @ApiOkResponse({ type: [Object] })
    // TODO ?entity_type=...
    async getFavorites(@CurrentUser() user: JwtPayload) {
        return await this.favoritesService.getFavorites(user.id);
    }
}
