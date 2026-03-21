import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';

import { FilmingLocationRequestDto } from './dto/filming-location-request.dto';
import { FilmingLocationWrapperResponseDto } from './dto/filming-location-response.dto';
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
}
