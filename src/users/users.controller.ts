import { Controller, Get, Body, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';

import { ProfileRequestDto } from './dto/profile-request.dto';
import { UserWrapperResponseDto } from './dto/user-wrapper-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    @ApiBearerAuth()
    @ApiOkResponse({ type: UserWrapperResponseDto })
    async getDtoById(@CurrentUser() user: JwtPayload) {
        return await this.usersService.getDtoById(user.id);
    }

    @Patch('profile')
    @ApiBearerAuth()
    @ApiOkResponse({ type: UserWrapperResponseDto })
    async createOrUpdateProfile(
        @CurrentUser() user: JwtPayload,
        @Body() dto: ProfileRequestDto
    ) {
        await this.usersService.update(user.id, dto);
        return await this.usersService.getDtoById(user.id);
    }
}
