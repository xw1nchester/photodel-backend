import {
    Body,
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';
import { EntityActionRequestDto } from '@shared/dto/entity-action-request.dto';
import { IdsRequestDto } from '@shared/dto/ids-request.dto';

import { LikesService } from './likes.service';

@Controller('likes')
export class LikesController {
    constructor(private readonly likesService: LikesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    async addLike(
        @CurrentUser() user: JwtPayload,
        @Body() dto: EntityActionRequestDto
    ) {
        await this.likesService.addLike(user.id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    async removeLike(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number
    ) {
        await this.likesService.removeLike(user.id, id);
    }

    @Post('bulk-delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    async bulkRemove(
        @CurrentUser() user: JwtPayload,
        @Body() { ids }: IdsRequestDto
    ) {
        await this.likesService.bulkRemove(user.id, ids);
    }
}
