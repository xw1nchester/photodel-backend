import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Query,
    UseGuards
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    getSchemaPath
} from '@nestjs/swagger';

import { CurrentUser, Role } from '@auth/decorators';
import { RoleEnum } from '@auth/enums/role.enum';
import { RoleGuard } from '@auth/guards/role.guard';
import { JwtPayload } from '@auth/interfaces';
import { PaginationResponseDto } from '@shared/dto/pagination-response.dto';
import { ProfileBasicResponseDto } from '@users/dto/profile-response.dto';
import { UserQueryDto } from '@users/dto/user-query.dto';
import { UsersService } from '@users/users.service';

@ApiTags('Admin')
@Controller('admin/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(RoleGuard)
    @Role(RoleEnum.MODERATOR)
    @Get()
    @ApiBearerAuth()
    @ApiOperation({
        description: 'Available for MODERATOR role'
    })
    @ApiExtraModels(PaginationResponseDto, ProfileBasicResponseDto)
    @ApiOkResponse({
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                $ref: getSchemaPath(ProfileBasicResponseDto)
                            }
                        }
                    }
                },
                { $ref: getSchemaPath(PaginationResponseDto) }
            ]
        }
    })
    async findAll(
        @Query() query: UserQueryDto,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.usersService.findAll({
            query,
            requesterUserId: user.id,
            professionalsOnly: false,
            excludeBlocked: false
        });
    }

    @UseGuards(RoleGuard)
    @Role(RoleEnum.MODERATOR)
    @Patch(':id/block')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiOperation({
        description: 'Available for MODERATOR role'
    })
    async blockUser(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        await this.usersService.setBlockedStatus(id, user.id, true);
    }

    @UseGuards(RoleGuard)
    @Role(RoleEnum.MODERATOR)
    @Patch(':id/unblock')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiOperation({
        description: 'Available for MODERATOR role'
    })
    async unblockUser(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        await this.usersService.setBlockedStatus(id, user.id, false);
    }
}
