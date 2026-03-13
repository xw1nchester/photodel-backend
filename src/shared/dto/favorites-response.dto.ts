import { ApiProperty } from '@nestjs/swagger';

export class FavoritesResponseDto {
    @ApiProperty({ example: false })
    isFavorite: boolean;

    @ApiProperty({ example: 1, nullable: true })
    favoriteId?: number;

    @ApiProperty({ example: 1 })
    count: boolean;
}
