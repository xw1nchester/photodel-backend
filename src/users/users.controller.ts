import {
    Controller,
    Get,
    Body,
    Patch,
    Delete,
    Query,
    Param,
    ParseIntPipe,
    UseGuards
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiExtraModels,
    ApiOkResponse,
    getSchemaPath
} from '@nestjs/swagger';

import { AlbumsService } from '@albums/albums.service';
import { AlbumResponseDto } from '@albums/dto/album-response.dto';
import { CurrentUser, Public } from '@auth/decorators';
import { OptionalJwtAuthGuard } from '@auth/guards/optional-jwt-auth.guard';
import { JwtPayload } from '@auth/interfaces';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginationResponseDto } from '@shared/dto/pagination-response.dto';

import { AvatarRequestDto } from './dto/avatar-request.dto';
import { CoordinatedQueryDto } from './dto/coordinates-query.dto';
import { MapQueryDto } from './dto/map-query.dto';
import { MapWrapperResponseDto } from './dto/map-response.dto';
import { ProfileRequestDto } from './dto/profile-request.dto';
import {
    ProfileBasicResponseDto,
    ProfileWrapperResponseDto
} from './dto/profile-response.dto';
import { UpdateNameRequestDto } from './dto/update-name-request.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserMeWrapperResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly albumsService: AlbumsService
    ) {}

    @Get('me')
    @ApiBearerAuth()
    @ApiOkResponse({ type: UserMeWrapperResponseDto })
    async getUserDtoById(@CurrentUser() user: JwtPayload) {
        return await this.usersService.getUserMeDtoById(user.id);
    }

    @Get('profile')
    @ApiBearerAuth()
    @ApiOkResponse({ type: ProfileWrapperResponseDto })
    async getProfileDtoByUserId(@CurrentUser() user: JwtPayload) {
        return await this.usersService.getProfileDtoByUserId({
            targetUserId: user.id,
            requesterUserId: user.id
        });
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id/profile')
    @ApiOkResponse({ type: ProfileWrapperResponseDto })
    async getProfileDtoById(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload,
        @Query() query: CoordinatedQueryDto
    ) {
        return await this.usersService.getProfileDtoByUserId({
            targetUserId: id,
            requesterUserId: user?.id,
            latitude: query.latitude,
            longitude: query.longitude
        });
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

    @Patch('name')
    @ApiBearerAuth()
    @ApiOkResponse({ type: UserMeWrapperResponseDto })
    async updateName(
        @CurrentUser() user: JwtPayload,
        @Body() dto: UpdateNameRequestDto
    ) {
        return await this.usersService.updateName(user.id, dto);
    }

    @Patch('avatar')
    @ApiBearerAuth()
    @ApiOkResponse({ type: UserMeWrapperResponseDto })
    async updateAvatar(
        @CurrentUser() user: JwtPayload,
        @Body() dto: AvatarRequestDto
    ) {
        return await this.usersService.updateAvatar(user.id, dto.avatar);
    }

    @Delete('avatar')
    @ApiBearerAuth()
    @ApiOkResponse({ type: UserMeWrapperResponseDto })
    async deleteAvatar(@CurrentUser() user: JwtPayload) {
        return await this.usersService.deleteAvatar(user.id);
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Get()
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
    async findProfessionals(
        @Query() query: UserQueryDto,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.usersService.findProfessionals(query, user?.id);
    }

    @Public()
    @Get('map')
    @ApiOkResponse({ type: MapWrapperResponseDto })
    async findMapMarkers(@Query() query: MapQueryDto) {
        return await this.usersService.findMapMarkers(query);
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id/albums')
    @ApiExtraModels(PaginationResponseDto, AlbumResponseDto)
    @ApiOkResponse({
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: getSchemaPath(AlbumResponseDto) }
                        }
                    }
                },
                { $ref: getSchemaPath(PaginationResponseDto) }
            ]
        }
    })
    async getUserAlbums(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload,
        @Query() pagination: PaginationQueryDto
    ) {
        return await this.albumsService.findByUserId({
            targetUserId: id,
            requesterUserId: user?.id,
            pagination,
            isPublished: true
        });
    }
}
