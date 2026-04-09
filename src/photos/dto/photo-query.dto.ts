import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString
} from 'class-validator';

import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { SortOption } from '@shared/enums/sort-option.enum';

export class PhotoQueryDto extends PaginationQueryDto {
    @ApiProperty({
        enum: SortOption,
        example: SortOption.NEWEST,
        required: false
    })
    @IsEnum(SortOption)
    @IsOptional()
    sort?: SortOption = SortOption.NEWEST;

    @ApiProperty({
        name: 'album_id',
        example: 1,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Expose({ name: 'album_id' })
    albumId?: number;

    @ApiProperty({
        name: 'excluded_album_id',
        example: 1,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Expose({ name: 'excluded_album_id' })
    excludedAlbumId?: number;

    @ApiProperty({
        name: 'user_id',
        example: 1,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Expose({ name: 'user_id' })
    userId?: number;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    @Transform(
        ({ value }) =>
            value === 'true' || value === true || value === 1 || value === '1'
    )
    my?: boolean;

    @ApiProperty({
        example: 'Баклажан',
        required: false
    })
    @IsString()
    @IsOptional()
    search?: string;

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
}
