import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt } from 'class-validator';

import { EntityType } from '@shared/enums/entity-type.enums';

export class EntityActionRequestDto {
    @ApiProperty({
        enum: EntityType,
        example: EntityType.PHOTO
    })
    @IsEnum(EntityType)
    entityType: EntityType;

    @ApiProperty({ example: 123 })
    @IsInt()
    entityId: number;
}
