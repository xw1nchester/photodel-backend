import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';

import { LocationRequestDto } from '@locations/dto/location-request.dto';

export class FilmingLocationRequestDto {
    @ApiProperty({ example: [1, 2, 3] })
    @IsArray()
    @ArrayMinSize(1)
    photoIds: number[];

    @ApiProperty({ example: 'ВДНХ' })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'Большая территория, красивая архитектура.',
        nullable: true
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ type: LocationRequestDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => LocationRequestDto)
    location?: LocationRequestDto;

    @ApiProperty({ example: 'Canon EOS 5D Mark IV', nullable: true })
    @IsString()
    @IsOptional()
    camera?: string;

    @ApiProperty({ example: '5000', nullable: true })
    @IsString()
    @IsOptional()
    price?: string;

    @ApiProperty({ example: 'По предоплате', nullable: true })
    @IsString()
    @IsOptional()
    conditions: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    isPublished: boolean;

    @ApiProperty({ example: [1, 2] })
    @IsArray()
    @IsNumber({}, { each: true })
    specializationIds: number[];
}
