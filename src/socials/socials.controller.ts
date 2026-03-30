import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { Public } from '@auth/decorators';

import { SocialsResponseDto } from './dto/socials-response.dto';
import { SocialsService } from './socials.service';

@Controller('socials')
export class SocialsController {
    constructor(private readonly socialsService: SocialsService) {}

    @Public()
    @Get()
    @ApiOkResponse({ type: SocialsResponseDto })
    async findAll() {
        return await this.socialsService.findAll();
    }
}
