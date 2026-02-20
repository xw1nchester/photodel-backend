import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { ProCategoriesService } from './pro-categories.service';
import { Public } from '@auth/decorators';
import { ProCategoriesResponseDto } from './dto/pro-categories-response.dto';

@ApiTags('Pro Categories')
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
