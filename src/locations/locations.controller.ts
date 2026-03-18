import { Controller, Get, Query } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { Public } from '@auth/decorators';
import { PaginationResponseDto } from '@shared/dto/pagination-response.dto';

import { PlaceResponseDto } from './dto/location-response.dto';
import { PlaceQueryDto } from './dto/place-query.dto';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) {}

    @Public()
    @Get('places')
    @ApiExtraModels(PaginationResponseDto, PlaceResponseDto)
    @ApiOkResponse({
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: getSchemaPath(PlaceResponseDto) }
                        }
                    }
                },
                { $ref: getSchemaPath(PaginationResponseDto) }
            ]
        }
    })
    async findPlaces(@Query() query: PlaceQueryDto) {
        return await this.locationsService.findPlaces(query);
    }
}
