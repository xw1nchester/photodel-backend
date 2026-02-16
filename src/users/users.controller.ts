import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';

import { UserWrapperResponseDto } from './dto/user-wrapper-response.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @ApiOkResponse({ type: UserWrapperResponseDto })
    async getDtoById(@CurrentUser() user: JwtPayload) {
        return await this.usersService.getDtoById(user.id);
    }
}
