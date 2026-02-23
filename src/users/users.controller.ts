import { Controller, Get, Body, Patch, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';

import { AvatarRequestDto } from './dto/avatar-request.dto';
import { ProfileRequestDto } from './dto/profile-request.dto';
import { ProfileWrapperResponseDto } from './dto/profile-response.dto';
import { UserWrapperResponseDto } from './dto/user-response.dto';
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

    @Patch('avatar')
    @ApiBearerAuth()
    @ApiOkResponse({ type: UserWrapperResponseDto })
    async updateAvatar(
        @CurrentUser() user: JwtPayload,
        @Body() dto: AvatarRequestDto
    ) {
        return await this.usersService.updateAvatar(user.id, dto.avatar);
    }

    @Delete('avatar')
    @ApiBearerAuth()
    @ApiOkResponse({ type: UserWrapperResponseDto })
    async deleteAvatar(@CurrentUser() user: JwtPayload) {
        return await this.usersService.deleteAvatar(user.id);
    }
}
