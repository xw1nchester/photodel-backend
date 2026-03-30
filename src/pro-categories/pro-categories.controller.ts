import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { Public } from '@auth/decorators';

import { ProCategoriesResponseDto } from './dto/pro-categories-response.dto';
import { ProCategoriesService } from './pro-categories.service';

@Controller('pro-categories')
export class ProCategoriesController {
    constructor(private readonly proCategoriesService: ProCategoriesService) {}

    @Public()
    @Get()
    @ApiOkResponse({ type: ProCategoriesResponseDto })
    async findAll() {
        return await this.proCategoriesService.findAll();
    }
}
