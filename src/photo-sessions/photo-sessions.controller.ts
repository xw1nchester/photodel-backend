import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiExtraModels,
    ApiOkResponse,
    getSchemaPath
} from '@nestjs/swagger';

import { CurrentUser, Public } from '@auth/decorators';
import { OptionalJwtAuthGuard } from '@auth/guards/optional-jwt-auth.guard';
import { JwtPayload } from '@auth/interfaces';
import { FilterQueryDto } from '@shared/dto/filter-query.dto';
import { IdsRequestDto } from '@shared/dto/ids-request.dto';
import { PaginationResponseDto } from '@shared/dto/pagination-response.dto';

import { PhotoSessionRequestDto } from './dto/photo-session-request.dto';
import {
    PhotoSessionBasicResponseDto,
    PhotoSessionWrapperResponseDto
} from './dto/photo-session-response.dto';
import { PhotoSessionsService } from './photo-sessions.service';

@Controller('photo-sessions')
export class PhotoSessionsController {
    constructor(private readonly photoSessionsService: PhotoSessionsService) {}

    @Post()
    @ApiBearerAuth()
    @ApiOkResponse({ type: PhotoSessionWrapperResponseDto })
    async create(
        @CurrentUser() user: JwtPayload,
        @Body() dto: PhotoSessionRequestDto
    ) {
        return await this.photoSessionsService.create(user.id, dto);
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Get()
    @ApiBearerAuth()
    @ApiExtraModels(PaginationResponseDto, PhotoSessionBasicResponseDto)
    @ApiOkResponse({
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                $ref: getSchemaPath(
                                    PhotoSessionBasicResponseDto
                                )
                            }
                        }
                    }
                },
                { $ref: getSchemaPath(PaginationResponseDto) }
            ]
        }
    })
    async findAll(
        @CurrentUser() user: JwtPayload,
        @Query() query: FilterQueryDto
    ) {
        return await this.photoSessionsService.findAll({
            pagination: query,
            sort: query.sort,
            requesterUserId: user?.id,
            targetUserId: query.userId,
            my: query.my
        });
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: PhotoSessionWrapperResponseDto })
    async getDtoById(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.photoSessionsService.getDtoById({
            id,
            requesterUserId: user?.id
        });
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: PhotoSessionWrapperResponseDto })
    async update(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: PhotoSessionRequestDto
    ) {
        return await this.photoSessionsService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: PhotoSessionWrapperResponseDto })
    async remove(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.photoSessionsService.remove(id, user.id);
    }

    @Post('bulk-delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    async bulkRemove(
        @CurrentUser() user: JwtPayload,
        @Body() { ids }: IdsRequestDto
    ) {
        await this.photoSessionsService.bulkRemove(user.id, ids);
    }
}
