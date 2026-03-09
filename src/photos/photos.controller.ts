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

import { PhotoRequestDto } from './dto/photo-request.dto';
import {
    PhotoResponseDto,
    PhotoWrapperResponseDto
} from './dto/photo-response.dto';
import { PhotosService } from './photos.service';
import { PaginationResponseDto } from '@shared/dto/pagination-response.dto';
import { PhotoQueryDto } from './dto/photo-query.dto';

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
    @ApiExtraModels(PaginationResponseDto, PhotoResponseDto)
    @ApiOkResponse({
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: getSchemaPath(PhotoResponseDto) }
                        }
                    }
                },
                { $ref: getSchemaPath(PaginationResponseDto) }
            ]
        }
    })
    async findAllMy(
        @CurrentUser() user: JwtPayload,
        @Query() query: PhotoQueryDto
    ) {
        return await this.photoService.findAllByUserId({
            userId: user.id,
            page: query.page,
            limit: query.limit,
            albumId: query.albumId
        });
    }

    @Get(':id')
    @ApiBearerAuth()
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

    @Post('bulk-delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    async bulkRemove(
        @CurrentUser() user: JwtPayload,
        @Body() { ids }: IdsRequestDto
    ) {
        await this.photoService.bulkRemove(user.id, ids);
    }

    // TODO: запросы публичных фотографий/фотографий пользователя
}
