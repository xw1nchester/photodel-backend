import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsISO8601,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested
} from 'class-validator';

import { LocationRequestDto } from '@locations/dto/location-request.dto';

export class FilmingRequestDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @Transform(({ value }) => Number(value))
    userId: number;

    @ApiProperty({
        type: String,
        format: 'date-time'
    })
    @IsISO8601()
    date: Date;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @Transform(({ value }) => Number(value))
    @Min(1)
    durationHours: number;

    @ApiProperty({ type: LocationRequestDto })
    @ValidateNested()
    @Type(() => LocationRequestDto)
    @IsNotEmpty()
    location: LocationRequestDto;

    @ApiProperty({ example: 'Архитектура' })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @Transform(({ value }) => Number(value))
    @Min(1)
    peoplesCount: number;

    @ApiProperty({ example: '500 рублей' })
    @IsString()
    @IsNotEmpty()
    budget: string;

    @ApiProperty({ example: false })
    @IsBoolean()
    needsMakeupArtist: boolean;

    @ApiProperty({ example: 'Коммент' })
    @IsString()
    @IsOptional()
    comment: string;
}
