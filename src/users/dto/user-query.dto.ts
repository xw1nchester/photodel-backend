import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
    IsInt,
    IsIn,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min
} from 'class-validator';

import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';

export class UserQueryDto extends PaginationQueryDto {
    @ApiProperty({
        example: 55.7558,
        minimum: -90,
        maximum: 90,
        required: false
    })
    @IsNumber()
    @Transform(obj => parseFloat(obj.value))
    @Min(-90)
    @Max(90)
    @IsOptional()
    latitude?: number;

    @ApiProperty({
        example: 37.6173,
        minimum: -180,
        maximum: 180,
        required: false
    })
    @IsNumber()
    @Transform(obj => parseFloat(obj.value))
    @Min(-180)
    @Max(180)
    @IsOptional()
    longitude?: number;

    @ApiProperty({
        example: 'popularity',
        enum: ['popularity', 'distance'],
        required: false
    })
    @IsOptional()
    @IsIn(['popularity', 'distance'])
    order?: 'popularity' | 'distance';

    @ApiProperty({
        example: 5,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    radius?: number;

    @ApiProperty({
        name: 'place_id',
        example: 1,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Expose({ name: 'place_id' })
    placeId?: number;

    @ApiProperty({
        example: 'Иван',
        required: false
    })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiProperty({
        name: 'pro_category_id',
        example: 1,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Expose({ name: 'pro_category_id' })
    proCategoryId?: number;

    @ApiProperty({
        name: 'specialization_id',
        example: 1,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Expose({ name: 'specialization_id' })
    specializationId?: number;

    // нужен ли статус (занят / не занят)?
}
