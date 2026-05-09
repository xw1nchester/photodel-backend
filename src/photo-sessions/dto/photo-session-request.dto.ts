import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsDateString,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';

import { LocationRequestDto } from '@locations/dto/location-request.dto';

export class PhotoSessionRequestDto {
    @ApiProperty({ example: [1, 2, 3] })
    @IsArray()
    @ArrayMinSize(1)
    photoIds: number[];

    @ApiProperty({ example: 'Предсвадебная фотосессия Овечкиных' })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'Вот и отгремела, пожалуй, самая ожидаемая и громкая свадьба',
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

    @ApiProperty({ example: '2024-06-01' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2024-08-31' })
    @IsDateString()
    endDate: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @Transform(({ value }) => Number(value))
    specializationId: number;

    @ApiProperty({ example: true })
    @IsBoolean()
    isPublished: boolean;

    @ApiProperty({ example: [1, 2, 3] })
    @IsArray()
    team: number[];
}
