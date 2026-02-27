import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, Min, Max, IsString, IsOptional } from 'class-validator';

export class LocationDto {
    // поле исключительно для response
    @ApiProperty({ example: 1, required: false })
    id: number;

    @ApiProperty({
        example: 55.7558,
        minimum: -90,
        maximum: 90
    })
    @IsNumber()
    @Transform(obj => parseFloat(obj.value))
    @Min(-90)
    @Max(90)
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
    longitude: number;

    @ApiProperty({
        example: 'Russia',
        required: false
    })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiProperty({
        example: 'Moscow',
        required: false
    })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiProperty({
        example: 'Tverskaya Street',
        required: false
    })
    @IsOptional()
    @IsString()
    street?: string;

    @ApiProperty({
        example: '1',
        required: false
    })
    @IsOptional()
    @IsString()
    houseNumber?: string;
}
