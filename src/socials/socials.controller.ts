import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { Public } from '@auth/decorators';

import {
    SiteSocialsWrapperResponseDto,
    SocialsWrapperResponseDto
} from './dto/socials-response.dto';
import { SocialsService } from './socials.service';

@Controller()
export class SocialsController {
    constructor(private readonly socialsService: SocialsService) {}

    @Public()
    @Get('socials')
    @ApiOkResponse({ type: SocialsWrapperResponseDto })
    async findAll() {
        return await this.socialsService.findAll();
    }

    @Public()
    @Get('site-socials')
    @ApiOkResponse({ type: SiteSocialsWrapperResponseDto })
    async findSiteSocials() {
        return await this.socialsService.findSiteSocials();
    }
}
