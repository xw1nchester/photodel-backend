import {
    Controller,
    Delete,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    HttpStatus,
    HttpCode,
    Query
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiExtraModels,
    ApiOkResponse,
    getSchemaPath
} from '@nestjs/swagger';

import { AlbumResponseDto } from '@albums/dto/album-response.dto';
import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';
import { FilmingLocationBasicResponseDto } from '@filming-locations/dto/filming-location-response.dto';
import { PhotoResponseDto } from '@photos/dto/photo-response.dto';
import { EntityActionQueryDto } from '@shared/dto/entity-action-query.dto';
import { EntityActionRequestDto } from '@shared/dto/entity-action-request.dto';
import { IdsRequestDto } from '@shared/dto/ids-request.dto';
import { PaginationResponseDto } from '@shared/dto/pagination-response.dto';
import { ProfileBasicResponseDto } from '@users/dto/profile-response.dto';

import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    async addFavorite(
        @CurrentUser() user: JwtPayload,
        @Body() dto: EntityActionRequestDto
    ) {
        await this.favoritesService.addFavorite(user.id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    async removeFavorite(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number
    ) {
        await this.favoritesService.removeFavorite(user.id, id);
    }

    @Get()
    @ApiBearerAuth()
    @ApiExtraModels(
        PaginationResponseDto,
        AlbumResponseDto,
        PhotoResponseDto,
        FilmingLocationBasicResponseDto,
        ProfileBasicResponseDto
    )
    @ApiOkResponse({
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                oneOf: [
                                    { $ref: getSchemaPath(AlbumResponseDto) },
                                    { $ref: getSchemaPath(PhotoResponseDto) },
                                    {
                                        $ref: getSchemaPath(
                                            FilmingLocationBasicResponseDto
                                        )
                                    },
                                    {
                                        $ref: getSchemaPath(
                                            ProfileBasicResponseDto
                                        )
                                    }
                                ]
                            }
                        }
                    }
                },
                { $ref: getSchemaPath(PaginationResponseDto) }
            ]
        }
    })
    async getFavorites(
        @CurrentUser() user: JwtPayload,
        @Query() query: EntityActionQueryDto
    ) {
        return await this.favoritesService.getFavorites(user.id, query);
    }

    @Post('bulk-delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    async bulkRemove(
        @CurrentUser() user: JwtPayload,
        @Body() { ids }: IdsRequestDto
    ) {
        await this.favoritesService.bulkRemove(user.id, ids);
    }
}
