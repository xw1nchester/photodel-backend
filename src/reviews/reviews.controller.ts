import { Body, Controller, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';
import { ReviewRequestDto } from './dto/review-request.dto';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ReviewWrapperResponseDto } from './dto/review-response.dto';

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
}
