import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CurrentUser, Public } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';
import { ReviewRequestDto } from './dto/review-request.dto';
import {
    ApiBearerAuth,
    ApiExtraModels,
    ApiOkResponse,
    getSchemaPath
} from '@nestjs/swagger';
import {
    ReviewResponseDto,
    ReviewWrapperResponseDto
} from './dto/review-response.dto';
import { OptionalJwtAuthGuard } from '@auth/guards/optional-jwt-auth.guard';
import { PaginationResponseDto } from '@shared/dto/pagination-response.dto';
import { ReviewQueryDto } from './dto/review-query.dto';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Post()
    @ApiBearerAuth()
    @ApiOkResponse({ type: ReviewWrapperResponseDto })
    async create(
        @CurrentUser() user: JwtPayload,
        @Body() dto: ReviewRequestDto
    ) {
        return await this.reviewsService.create(user.id, dto);
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Get()
    @ApiBearerAuth()
    @ApiExtraModels(PaginationResponseDto, ReviewResponseDto)
    @ApiOkResponse({
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                $ref: getSchemaPath(ReviewResponseDto)
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
        @Query() query: ReviewQueryDto
    ) {
        return await this.reviewsService.findAll({
            entityType: query.type,
            pagination: query,
            requesterUserId: user?.id,
            entityId: query.entityId,
            my: query.my
        });
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: ReviewWrapperResponseDto })
    async getDtoById(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.reviewsService.getDtoById({
            id,
            requesterUserId: user.id
        });
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: ReviewWrapperResponseDto })
    async update(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ReviewRequestDto
    ) {
        return await this.reviewsService.update(id, user.id, dto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: ReviewWrapperResponseDto })
    async remove(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseIntPipe) id: number
    ) {
        return await this.reviewsService.remove(id, user.id);
    }
}
