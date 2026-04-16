import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { Transform } from 'class-transformer';
import { PlaceSortOption } from '@locations/enums/place-sort-option.enum';

export class PlaceQueryDto extends PaginationQueryDto {
    @ApiProperty({
        example: 'Калининград',
        required: false
    })
    @IsString()
    @IsOptional()
    search?: string;

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
        enum: PlaceSortOption,
        example: PlaceSortOption.ALPHABET,
        required: false
    })
    @IsEnum(PlaceSortOption)
    @IsOptional()
    sort?: PlaceSortOption = PlaceSortOption.ALPHABET;
}
