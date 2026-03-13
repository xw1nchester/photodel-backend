import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { FavoriteEntityType } from '@favorites/enums';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';

export class FavoriteQueryDto extends PaginationQueryDto {
    @ApiProperty({
        enum: FavoriteEntityType,
        example: FavoriteEntityType.PHOTO
    })
    @IsEnum(FavoriteEntityType)
    type: FavoriteEntityType;
}
