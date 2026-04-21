import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsDateString,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';

import { LocationRequestDto } from '@locations/dto/location-request.dto';

export class TrainingRequestDto {
    @ApiProperty({ example: [1, 2, 3] })
    @IsArray()
    @ArrayMinSize(1)
    photoIds: number[];

    @ApiProperty({ example: 'Мастер-класс по портретной съёмке' })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'Обучение основам портретной фотографии',
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

    @ApiProperty({ example: 'Мастер-класс' })
    @IsString()
    type: string;

    @ApiProperty({ example: 'Оффлайн' })
    @IsString()
    format: string;

    @ApiProperty({ example: '2024-06-01' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2024-08-31' })
    @IsDateString()
    endDate: string;

    @ApiProperty({ example: '5000 руб.' })
    @IsString()
    price: string;

    @ApiProperty({ example: '1000 руб.' })
    @IsString()
    prepayment: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    isPublished: boolean;

    @ApiProperty({ example: [1, 2, 3] })
    @IsArray()
    team: number[];

    @ApiProperty({ example: [1, 2, 3] })
    @IsArray()
    organizers: number[];
}
