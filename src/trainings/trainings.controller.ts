import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiExtraModels,
    ApiOkResponse,
    getSchemaPath
} from '@nestjs/swagger';

import { CurrentUser, Public } from '@auth/decorators';
import { OptionalJwtAuthGuard } from '@auth/guards/optional-jwt-auth.guard';
import { JwtPayload } from '@auth/interfaces';
import { FilterQueryDto } from '@shared/dto/filter-query.dto';
import { IdsRequestDto } from '@shared/dto/ids-request.dto';
import { PaginationResponseDto } from '@shared/dto/pagination-response.dto';

import { TrainingRequestDto } from './dto/training-request.dto';
import {
    TrainingBasicResponseDto,
    TrainingWrapperResponseDto
} from './dto/training-response.dto';
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

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Get()
    @ApiBearerAuth()
    @ApiExtraModels(PaginationResponseDto, TrainingBasicResponseDto)
    @ApiOkResponse({
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                $ref: getSchemaPath(TrainingBasicResponseDto)
                            }
                        }
                    }
                },
                { $ref: getSchemaPath(PaginationResponseDto) }
            ]
        }
    })
    async findAll(
        @CurrentUser() user: JwtPayload,
        @Query() query: FilterQueryDto
    ) {
        return await this.trainingsService.findAll(query, user?.id);
    }

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

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: TrainingWrapperResponseDto })
    async update(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: TrainingRequestDto
    ) {
        return await this.trainingsService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: TrainingWrapperResponseDto })
    async remove(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.trainingsService.remove(id, user.id);
    }

    @Post('bulk-delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    async bulkRemove(
        @CurrentUser() user: JwtPayload,
        @Body() { ids }: IdsRequestDto
    ) {
        await this.trainingsService.bulkRemove(user.id, ids);
    }
}
