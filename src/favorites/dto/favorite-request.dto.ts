import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt } from 'class-validator';

import { FavoriteEntityType } from '../enums';

export class FavoriteRequestDto {
    @ApiProperty({
        enum: FavoriteEntityType,
        example: FavoriteEntityType.PHOTO
    })
    @IsEnum(FavoriteEntityType)
    entityType: FavoriteEntityType;

    @ApiProperty({ example: 123 })
    @IsInt()
    entityId: number;
}
