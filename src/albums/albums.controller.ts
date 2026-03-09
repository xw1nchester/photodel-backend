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
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginationResponseDtoFactory } from '@shared/dto/pagination-response.factory';

import { AlbumsService } from './albums.service';
import { AlbumRequestDto } from './dto/album-request.dto';
import {
    AlbumResponseDto,
    AlbumWrapperResponseDto
} from './dto/album-response.dto';
import { IdsRequestDto } from '@shared/dto/ids-request.dto';

@Controller('albums')
export class AlbumsController {
    constructor(private readonly albumService: AlbumsService) {}

    @Post()
    @ApiBearerAuth()
    @ApiOkResponse({ type: AlbumWrapperResponseDto })
    async create(
        @CurrentUser() user: JwtPayload,
        @Body() dto: AlbumRequestDto
    ) {
        return await this.albumService.create(user.id, dto);
    }

    @Get('my')
    @ApiBearerAuth()
    @ApiOkResponse({ type: PaginationResponseDtoFactory(AlbumResponseDto) })
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

    // TODO: запросы публичных альбомов/альбома пользователя
}
