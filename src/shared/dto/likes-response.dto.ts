import { ApiProperty } from '@nestjs/swagger';

export class LikesResponseDto {
    @ApiProperty({ example: false })
    isLiked: boolean;

    @ApiProperty({ example: 1, nullable: true })
    likeId?: number;

    @ApiProperty({ example: 1 })
    count: boolean;
}
