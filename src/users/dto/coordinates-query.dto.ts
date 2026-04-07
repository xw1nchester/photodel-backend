import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CoordinatedQueryDto {
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
}
