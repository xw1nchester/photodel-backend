import {
    Body,
    Controller,
    Delete,
    Param,
    Patch,
    Post,
    UseGuards,
    HttpCode,
    ParseIntPipe,
    HttpStatus,
    Put
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

import { Role } from '@auth/decorators';
import { RoleEnum } from '@auth/enums/role.enum';
import { RoleGuard } from '@auth/guards/role.guard';
import { SocialsService } from '@socials/socials.service';

import { SocialRequestDto } from './dto/social-request.dto';
import { SocialWrapperResponseDto } from '@socials/dto/socials-response.dto';
import { SiteSocialsRequestDto } from './dto/site-socials.request.dto';

@ApiTags('Admin')
@UseGuards(RoleGuard)
@Role(RoleEnum.ADMIN)
@Controller()
export class SocialsController {
    constructor(private readonly socialsService: SocialsService) {}

    @Post('admin/socials')
    @ApiBearerAuth()
    @ApiOperation({
        description: 'Available for ADMIN role'
    })
    @ApiCreatedResponse({ type: SocialWrapperResponseDto })
    async create(@Body() dto: SocialRequestDto) {
        return await this.socialsService.create(dto);
    }

    @Patch('admin/socials/:id')
    @ApiBearerAuth()
    @ApiOperation({
        description: 'Available for ADMIN role'
    })
    @ApiOkResponse({ type: SocialWrapperResponseDto })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: SocialRequestDto
    ) {
        return await this.socialsService.update(id, dto);
    }

    @Delete('admin/socials/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiOperation({
        description: 'Available for ADMIN role'
    })
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.socialsService.delete(id);
    }

    @Put('admin/site-socials')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        description: 'Available for ADMIN role'
    })
    async updateSiteSocials(@Body() dto: SiteSocialsRequestDto) {
        return await this.socialsService.updateSiteSocials(dto);
    }
}
