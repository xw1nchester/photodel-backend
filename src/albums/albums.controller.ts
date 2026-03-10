import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    Query,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiExtraModels,
    ApiOkResponse,
    getSchemaPath
} from '@nestjs/swagger';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';
import { IdsRequestDto } from '@shared/dto/ids-request.dto';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginationResponseDto } from '@shared/dto/pagination-response.dto';

import { AlbumsService } from './albums.service';
import {
    AlbumCreateRequestDto,
    AlbumRequestDto
} from './dto/album-request.dto';
import {
    AlbumResponseDto,
    AlbumWrapperResponseDto
} from './dto/album-response.dto';

@Controller('albums')
export class AlbumsController {
    constructor(private readonly albumService: AlbumsService) {}

    @Post()
    @ApiBearerAuth()
    @ApiOkResponse({ type: AlbumWrapperResponseDto })
    async create(
        @CurrentUser() user: JwtPayload,
        @Body() dto: AlbumCreateRequestDto
    ) {
        return await this.albumService.create(user.id, dto);
    }

    @Get('my')
    @ApiBearerAuth()
    @ApiExtraModels(PaginationResponseDto, AlbumResponseDto)
    @ApiOkResponse({
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: getSchemaPath(AlbumResponseDto) }
                        }
                    }
                },
                { $ref: getSchemaPath(PaginationResponseDto) }
            ]
        }
    })
    async findAllMy(
        @CurrentUser() user: JwtPayload,
        @Query() pagination: PaginationQueryDto
    ) {
        return await this.albumService.findAllByUserId(user.id, pagination);
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: AlbumWrapperResponseDto })
    async getDtoById(@Param('id', ParseIntPipe) id: number) {
        return await this.albumService.getDtoById(id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: AlbumWrapperResponseDto })
    async update(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AlbumRequestDto
    ) {
        return await this.albumService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: AlbumWrapperResponseDto })
    async remove(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.albumService.remove(id, user.id);
    }

    @Post('bulk-delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    async bulkRemove(
        @CurrentUser() user: JwtPayload,
        @Body() { ids }: IdsRequestDto
    ) {
        await this.albumService.bulkRemove(user.id, ids);
    }

    @Post(':id/photos')
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    async addPhotosToAlbum(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) albumId: number,
        @Body() { ids }: IdsRequestDto
    ) {
        await this.albumService.addPhotos(user.id, albumId, ids);
    }

    @Post(':id/photos/bulk-delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    async removePhotosFromAlbum(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) albumId: number,
        @Body() { ids }: IdsRequestDto
    ) {
        await this.albumService.removePhotos(user.id, albumId, ids);
    }
}
