import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';

import { FilmingRequestDto } from './dto/filming-request.dto';
import { FilmingRequestWrapperResponseDto } from './dto/filming-response.dto';
import { FilmingRequestsService } from './filming-requests.service';

@Controller('filming-requests')
export class FilmingRequestsController {
    constructor(
        private readonly filmingRequestsService: FilmingRequestsService
    ) {}

    @Post()
    @ApiBearerAuth()
    async sendRequest(
        @CurrentUser() user: JwtPayload,
        @Body() dto: FilmingRequestDto
    ) {
        await this.filmingRequestsService.sendRequest(user.id, dto);
    }

    @Patch(':id/accept')
    @ApiBearerAuth()
    async acceptRequest(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        await this.filmingRequestsService.acceptRequest(id, user.id);
    }

    @Patch(':id/reject')
    @ApiBearerAuth()
    async rejectRequest(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        await this.filmingRequestsService.rejectRequest(id, user.id);
    }

    // завершить?

    @Delete(':id')
    @ApiBearerAuth()
    async removeRequest(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        await this.filmingRequestsService.removeRequest(id, user.id);
    }

    // нужна наверно паджинация
    @Get()
    @ApiBearerAuth()
    @ApiOkResponse({ type: FilmingRequestWrapperResponseDto })
    async findRequests(@CurrentUser() user: JwtPayload) {
        return await this.filmingRequestsService.findRequests(user.id);
    }
}
