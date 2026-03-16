import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';

export class PhotoQueryDto extends PaginationQueryDto {
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
}
