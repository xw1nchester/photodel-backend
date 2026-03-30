import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { EntityType } from '@shared/enums/entity-type.enums';

import { PaginationQueryDto } from './pagination-query.dto';

export class EntityActionQueryDto extends PaginationQueryDto {
    @ApiProperty({
        enum: EntityType,
        example: EntityType.PHOTO
    })
    @IsEnum(EntityType)
    type: EntityType;
}
