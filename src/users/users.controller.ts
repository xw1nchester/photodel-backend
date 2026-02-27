import {
    Controller,
    Get,
    Body,
    Patch,
    Delete,
    Query,
    Param,
    ParseFloatPipe,
    ParseIntPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

import { CurrentUser, Public } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';

import { AvatarRequestDto } from './dto/avatar-request.dto';
import { NearbyUsersWrapperResponseDto } from './dto/nearby-user-response.dto';
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

    @Public()
    @Get(':id/profile')
    @ApiOkResponse({ type: ProfileWrapperResponseDto })
    async getProfileDtoById(@Param('id', ParseIntPipe) id: number) {
        return await this.usersService.getProfileDtoByUserId(id);
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

    @Public()
    @Get('nearby')
    @ApiQuery({ name: 'latitude', example: 55.7558 })
    @ApiQuery({ name: 'longitude', example: 37.6173 })
    @ApiOkResponse({ type: NearbyUsersWrapperResponseDto })
    async findNearbyUsers(
        @Query('latitude', ParseFloatPipe) latitude: number,
        @Query('longitude', ParseFloatPipe) longitude: number
    ) {
        return await this.usersService.findNearbyUsers(latitude, longitude);
    }
}
