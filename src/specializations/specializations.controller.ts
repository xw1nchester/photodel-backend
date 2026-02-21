import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Public } from '@auth/decorators';

import { SpecializationsResponseDto } from './dto/specializations-response.dto';
import { SpecializationsService } from './specializations.service';

@ApiTags('Specializations')
@Controller('specializations')
export class SpecializationsController {
    constructor(
        private readonly specializationsService: SpecializationsService
    ) {}

    @Public()
    @Get()
    @ApiQuery({ name: 'category_ids', required: false, type: [Number] })
    @ApiOkResponse({ type: SpecializationsResponseDto })
    async findAll(@Query('category_ids') categoryIds?: string | string[]) {
        const categoryIdArray = categoryIds
            ? (Array.isArray(categoryIds) ? categoryIds : [categoryIds]).map(
                  id => parseInt(id, 10)
              )
            : undefined;
        return await this.specializationsService.findAll(categoryIdArray);
    }
}
