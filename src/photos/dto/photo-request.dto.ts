import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';

import { LocationRequestDto } from '@locations/dto/location-request.dto';

export class PhotoRequestDto {
    @ApiProperty({ example: 'e7cb06e8-1335-4b5c-bb46-0edfd4015aa1.jpeg' })
    @IsString()
    image: string;

    @ApiProperty({ example: 'Моя фотография' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'Описание фотографии', nullable: true })
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

    @ApiProperty({ example: 'f/2.8', nullable: true })
    @IsString()
    @IsOptional()
    aperture?: string;

    @ApiProperty({ example: '50mm', nullable: true })
    @IsString()
    @IsOptional()
    focalLength?: string;

    @ApiProperty({ example: '1/200s', nullable: true })
    @IsString()
    @IsOptional()
    shutterSpeed?: string;

    @ApiProperty({ example: 400, nullable: true })
    @IsNumber()
    @IsOptional()
    iso?: number;

    @ApiProperty({ example: 'On', nullable: true })
    @IsString()
    @IsOptional()
    flash?: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    isForSale: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    isPublished: boolean;

    @ApiProperty({ example: [1, 2] })
    @IsArray()
    @IsNumber({}, { each: true })
    specializationIds: number[];

    @ApiProperty({ example: [1, 2, 3] })
    @IsArray()
    @IsNumber({}, { each: true })
    albumIds: number[];
}
