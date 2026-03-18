import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class MapQueryDto {
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

    // @ApiProperty({
    //     example: 5,
    //     required: false
    // })
    // @IsOptional()
    // @Type(() => Number)
    // @IsInt()
    // radius?: number;
}
