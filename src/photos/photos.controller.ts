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

import { PhotoRequestDto } from './dto/photo-request.dto';
import {
    PhotosListWrapperResponseDto,
    PhotoWrapperResponseDto
} from './dto/photo-response.dto';
import { PhotosService } from './photos.service';

@Controller('photos')
export class PhotosController {
    constructor(private readonly photoService: PhotosService) {}

    @Post()
    @ApiBearerAuth()
    @ApiOkResponse({ type: PhotoWrapperResponseDto })
    async create(
        @CurrentUser() user: JwtPayload,
        @Body() dto: PhotoRequestDto
    ) {
        return await this.photoService.create(user.id, dto);
    }

    @Get('my')
    @ApiBearerAuth()
    @ApiOkResponse({ type: PhotosListWrapperResponseDto })
    async findAllMy(@CurrentUser() user: JwtPayload) {
        return await this.photoService.findAllByUserId(user.id);
    }

    @Get(':id')
    @ApiOkResponse({ type: PhotoWrapperResponseDto })
    async getDtoById(@Param('id', ParseIntPipe) id: number) {
        return await this.photoService.getDtoById(id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: PhotoWrapperResponseDto })
    async update(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: PhotoRequestDto
    ) {
        return await this.photoService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: PhotoWrapperResponseDto })
    async remove(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.photoService.remove(id, user.id);
    }

    // TODO: запросы публичных фотографий/фотографий пользователя
}
