import {
    Controller,
    Get,
    Body,
    Patch,
    Delete,
    Query,
    Param,
    ParseFloatPipe,
    ParseIntPipe,
    UseGuards
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiExtraModels,
    ApiOkResponse,
    ApiQuery,
    getSchemaPath
} from '@nestjs/swagger';

import { AlbumsService } from '@albums/albums.service';
import { AlbumResponseDto } from '@albums/dto/album-response.dto';
import { CurrentUser, Public } from '@auth/decorators';
import { OptionalJwtAuthGuard } from '@auth/guards/optional-jwt-auth.guard';
import { JwtPayload } from '@auth/interfaces';
import { PhotoQueryDto } from '@photos/dto/photo-query.dto';
import { PhotoResponseDto } from '@photos/dto/photo-response.dto';
import { PhotosService } from '@photos/photos.service';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginationResponseDto } from '@shared/dto/pagination-response.dto';

import { AvatarRequestDto } from './dto/avatar-request.dto';
import { NearbyUsersWrapperResponseDto } from './dto/nearby-user-response.dto';
import { ProfileRequestDto } from './dto/profile-request.dto';
import { ProfileWrapperResponseDto } from './dto/profile-response.dto';
import { UpdateNameRequestDto } from './dto/update-name-request.dto';
import { UserMeWrapperResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly albumsService: AlbumsService,
        private readonly photosService: PhotosService
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
            targetUserId: user.id
        });
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id/profile')
    @ApiOkResponse({ type: ProfileWrapperResponseDto })
    async getProfileDtoById(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.usersService.getProfileDtoByUserId({
            targetUserId: id,
            requesterUserId: user?.id
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

    @Public()
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
        @Query() pagination: PaginationQueryDto
    ) {
        return await this.albumsService.findAllByUserId(id, pagination, true);
    }

    @Public()
    @Get(':id/photos')
    @ApiExtraModels(PaginationResponseDto, PhotoResponseDto)
    @ApiOkResponse({
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: getSchemaPath(PhotoResponseDto) }
                        }
                    }
                },
                { $ref: getSchemaPath(PaginationResponseDto) }
            ]
        }
    })
    async getUserPhotos(
        @Param('id', ParseIntPipe) userId: number,
        @Query() query: PhotoQueryDto
    ) {
        return await this.photosService.findByUserId({
            userId,
            page: query.page,
            limit: query.limit,
            albumId: query.albumId,
            isPublished: true
        });
    }
}
