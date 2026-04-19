import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min
} from 'class-validator';

import { EntityActionRequestDto } from '@shared/dto/entity-action-request.dto';

export class ReviewRequestDto extends EntityActionRequestDto {
    @ApiProperty({
        example: 'Чудненько'
    })
    @IsString()
    content?: string;

    @ApiProperty({
        example: 5,
        required: false,
        nullable: true
    })
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsOptional()
    rating?: number;

    @ApiProperty({ example: [1, 2, 3] })
    @IsArray()
    photoIds: number[];
}
