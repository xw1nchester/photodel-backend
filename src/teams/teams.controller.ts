import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';

import { TeamRequestQueryDto } from './dto/team-request-query.dto';
import { TeamRequestDto } from './dto/team-request.dto';
import { TeamRequestWrapperResponseDto } from './dto/team-response.dto';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) {}

    @Post('requests')
    @ApiBearerAuth()
    async sendRequest(
        @CurrentUser() user: JwtPayload,
        @Body() dto: TeamRequestDto
    ) {
        await this.teamsService.sendRequest(user.id, dto.userId);
    }

    @Patch('requests/:id/accept')
    @ApiBearerAuth()
    async acceptRequest(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        await this.teamsService.acceptRequest(id, user.id);
    }

    @Patch('requests/:id/reject')
    @ApiBearerAuth()
    async rejectRequest(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        await this.teamsService.rejectRequest(id, user.id);
    }

    @Delete('requests/:id')
    @ApiBearerAuth()
    async removeRequest(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        await this.teamsService.removeRequest(id, user.id);
    }

    @Get('requests')
    @ApiBearerAuth()
    @ApiOkResponse({ type: TeamRequestWrapperResponseDto })
    async findRequests(
        @CurrentUser() user: JwtPayload,
        @Query() query: TeamRequestQueryDto
    ) {
        return await this.teamsService.findRequests(user.id, query);
    }
}
