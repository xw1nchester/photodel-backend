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
import { PaginationResponseDto } from '@shared/dto/pagination-response.dto';

import { FilmingLocationQueryDto } from './dto/filming-location-query.dtoy';
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

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
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
    async findAll(
        @CurrentUser() user: JwtPayload,
        @Query() query: FilmingLocationQueryDto
    ) {
        return await this.filmingLocationsService.findAll({
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
