import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';

export class PlaceQueryDto extends PaginationQueryDto {
    @ApiProperty({
        example: 'Калининград',
        required: false
    })
    @IsString()
    @IsOptional()
    search?: string;
}
