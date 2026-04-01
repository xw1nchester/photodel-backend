import { ApiProperty } from '@nestjs/swagger';

export class ReviewsResponseDto {
    @ApiProperty({ example: 1 })
    count: boolean;
}
