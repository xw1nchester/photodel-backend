import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

import { EntityActionQueryDto } from '@shared/dto/entity-action-query.dto';
import { Expose, Transform, Type } from 'class-transformer';

export class ReviewQueryDto extends EntityActionQueryDto {
    @ApiProperty({
        name: 'entity_id',
        example: 1,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Expose({ name: 'entity_id' })
    entityId?: number;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
    my?: boolean;
}
