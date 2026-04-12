import { ApiProperty } from '@nestjs/swagger';

export class ReviewsResponseDto {
    @ApiProperty({ example: 1 })
    count: boolean;

    @ApiProperty({ example: 4.25 })
    rating: number;
}
