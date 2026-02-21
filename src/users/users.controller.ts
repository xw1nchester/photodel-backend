import { Controller, Get, Body, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';

import { ProfileRequestDto } from './dto/profile-request.dto';
import { ProfileWrapperResponseDto } from './dto/profile-wrapper-response.dto';
import { UserWrapperResponseDto } from './dto/user-wrapper-response.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    @ApiBearerAuth()
    @ApiOkResponse({ type: UserWrapperResponseDto })
    async getUserDtoById(@CurrentUser() user: JwtPayload) {
        return await this.usersService.getUserDtoById(user.id);
    }

    @Get('profile')
    @ApiBearerAuth()
    @ApiOkResponse({ type: ProfileWrapperResponseDto })
    async getProfileDtoByUserId(@CurrentUser() user: JwtPayload) {
        return await this.usersService.getProfileDtoByUserId(user.id);
    }

    @Patch('profile')
    @ApiBearerAuth()
    @ApiOkResponse({ type: ProfileWrapperResponseDto })
    async updateProfile(
        @CurrentUser() user: JwtPayload,
        @Body() dto: ProfileRequestDto
    ) {
        return await this.usersService.updateProfile(user.id, dto);
    }
}
