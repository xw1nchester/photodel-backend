import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser, Public } from '@auth/decorators';
import { OptionalJwtAuthGuard } from '@auth/guards/optional-jwt-auth.guard';
import { JwtPayload } from '@auth/interfaces';

import { TrainingRequestDto } from './dto/training-request.dto';
import { TrainingWrapperResponseDto } from './dto/training-response.dto';
import { TrainingsService } from './trainings.service';

@Controller('trainings')
export class TrainingsController {
    constructor(private readonly trainingsService: TrainingsService) {}

    @Post()
    @ApiBearerAuth()
    @ApiOkResponse({ type: TrainingWrapperResponseDto })
    async create(
        @CurrentUser() user: JwtPayload,
        @Body() dto: TrainingRequestDto
    ) {
        return await this.trainingsService.create(user.id, dto);
    }

    // findAll

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: TrainingWrapperResponseDto })
    async getDtoById(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.trainingsService.getDtoById({
            id,
            requesterUserId: user?.id
        });
    }
}
