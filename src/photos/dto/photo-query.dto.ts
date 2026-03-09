import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class PhotoQueryDto extends PaginationQueryDto {
    @ApiProperty({
        name: 'album_id',
        example: 1,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    albumId?: number;
}
