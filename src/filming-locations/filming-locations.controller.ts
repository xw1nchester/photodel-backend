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
import { IdsRequestDto } from '@shared/dto/ids-request.dto';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginationResponseDto } from '@shared/dto/pagination-response.dto';

import { FilmingLocationRequestDto } from './dto/filming-location-request.dto';
import {
    FilmingLocationBasicResponseDto,
    FilmingLocationWrapperResponseDto
} from './dto/filming-location-response.dto';
import { FilmingLocationsService } from './filming-locations.service';

@Controller('filming-locations')
export class FilmingLocationsController {
    constructor(
        private readonly filmingLocationsService: FilmingLocationsService
    ) {}

    @Post()
    @ApiBearerAuth()
    @ApiOkResponse({ type: FilmingLocationWrapperResponseDto })
    async create(
        @CurrentUser() user: JwtPayload,
        @Body() dto: FilmingLocationRequestDto
    ) {
        return await this.filmingLocationsService.create(user.id, dto);
    }

    @Get()
    @ApiBearerAuth()
    @ApiExtraModels(PaginationResponseDto, FilmingLocationBasicResponseDto)
    @ApiOkResponse({
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                $ref: getSchemaPath(
                                    FilmingLocationBasicResponseDto
                                )
                            }
                        }
                    }
                },
                { $ref: getSchemaPath(PaginationResponseDto) }
            ]
        }
    })
    async findMy(
        @CurrentUser() user: JwtPayload,
        @Query() query: PaginationQueryDto
    ) {
        return await this.filmingLocationsService.findByUserId({
            targetUserId: user.id,
            requesterUserId: user.id,
            pagination: query
        });
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: FilmingLocationWrapperResponseDto })
    async getDtoById(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.filmingLocationsService.getDtoById({
            id,
            requesterUserId: user?.id
        });
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: FilmingLocationWrapperResponseDto })
    async update(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: FilmingLocationRequestDto
    ) {
        return await this.filmingLocationsService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: FilmingLocationWrapperResponseDto })
    async remove(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.filmingLocationsService.remove(id, user.id);
    }

    @Post('bulk-delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    async bulkRemove(
        @CurrentUser() user: JwtPayload,
        @Body() { ids }: IdsRequestDto
    ) {
        await this.filmingLocationsService.bulkRemove(user.id, ids);
    }
}
