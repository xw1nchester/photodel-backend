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

import { TrainingUserRequestDto } from './dto/training-request.dto';
import { TrainingRequestWrapperResponseDto } from './dto/training-response.dto';
import { TrainingRequestsService } from './training-requests.service';

@Controller('training-requests')
export class TrainingRequestsController {
    constructor(
        private readonly trainingRequestsService: TrainingRequestsService
    ) {}

    @Post()
    @ApiBearerAuth()
    async sendRequest(
        @CurrentUser() user: JwtPayload,
        @Body() dto: TrainingUserRequestDto
    ) {
        await this.trainingRequestsService.sendRequest(user.id, dto);
    }

    @Patch(':id/accept')
    @ApiBearerAuth()
    async acceptRequest(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        await this.trainingRequestsService.acceptRequest(id, user.id);
    }

    @Patch(':id/reject')
    @ApiBearerAuth()
    async rejectRequest(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        await this.trainingRequestsService.rejectRequest(id, user.id);
    }

    @Delete(':id')
    @ApiBearerAuth()
    async removeRequest(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        await this.trainingRequestsService.removeRequest(id, user.id);
    }

    @Get()
    @ApiBearerAuth()
    @ApiOkResponse({ type: TrainingRequestWrapperResponseDto })
    async findRequests(@CurrentUser() user: JwtPayload) {
        return await this.trainingRequestsService.findRequests(user.id);
    }
}
