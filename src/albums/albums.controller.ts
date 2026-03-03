import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';

import { AlbumsService } from './albums.service';
import { AlbumRequestDto } from './dto/album-request.dto';
import {
    AlbumResponseDto,
    AlbumsListWrapperResponseDto
} from './dto/album-response.dto';

@Controller('albums')
export class AlbumsController {
    constructor(private readonly albumService: AlbumsService) {}

    @Post()
    @ApiBearerAuth()
    @ApiOkResponse({ type: AlbumResponseDto })
    async create(
        @CurrentUser() user: JwtPayload,
        @Body() dto: AlbumRequestDto
    ) {
        return await this.albumService.create(user.id, dto);
    }

    @Get('my')
    @ApiBearerAuth()
    @ApiOkResponse({ type: AlbumsListWrapperResponseDto })
    async findAllMy(@CurrentUser() user: JwtPayload) {
        return await this.albumService.findAllByUserId(user.id);
    }

    @Get(':id')
    @ApiOkResponse({ type: AlbumResponseDto })
    async getDtoById(@Param('id', ParseIntPipe) id: number) {
        return await this.albumService.getDtoById(id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: AlbumResponseDto })
    async update(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AlbumRequestDto
    ) {
        return await this.albumService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: AlbumResponseDto })
    async remove(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.albumService.remove(id, user.id);
    }

    // TODO: запросы публичных альбомов/альбома пользователя
}
