import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, Min, Max } from 'class-validator';

export class CoordinatesDto {
    @ApiProperty({
        example: 55.7558,
        minimum: -90,
        maximum: 90
    })
    @IsNumber()
    @Transform(obj => parseFloat(obj.value))
    @Min(-90)
    @Max(90)
    // @IsLatitude()
    latitude: number;

    @ApiProperty({
        example: 37.6173,
        minimum: -180,
        maximum: 180
    })
    @IsNumber()
    @Transform(obj => parseFloat(obj.value))
    @Min(-180)
    @Max(180)
    // @IsLongitude()
    longitude: number;
}
