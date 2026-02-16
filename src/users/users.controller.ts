import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';
import { ApiOkResponse } from '@nestjs/swagger';
import { UserWrapperResponseDto } from './dto/user-wrapper-response.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @ApiOkResponse({ type: UserWrapperResponseDto })
    async getDtoById(@CurrentUser() user: JwtPayload) {
        return await this.usersService.getDtoById(user.id);
    }
}
