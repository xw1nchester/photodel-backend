import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';

import { LocationDto } from '@locations/dto/location.dto';
import { NoDateOverlap } from '@users/validators/no-date-overlap.decorator';

export class ProfileSocialDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'https://instagram.com/user' })
    value: string;
}

export class TemporaryLocationDto {
    @ApiProperty({ example: '2024-06-01' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2024-08-31' })
    @IsDateString()
    endDate: string;

    @ApiProperty({ type: LocationDto })
    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;

    @ApiProperty({
        example: 'Отпуск в Италии',
        required: false,
        nullable: true
    })
    @IsString()
    @IsOptional()
    comment?: string;
}

export class ProfileRequestDto {
    @ApiProperty({ example: 'Свободен', nullable: true })
    @IsString()
    @IsOptional()
    status: string;

    @ApiProperty({ example: '5000', nullable: true })
    @IsString()
    @IsOptional()
    price: string;

    @ApiProperty({ example: 'Только на условиях предоплаты', nullable: true })
    @IsString()
    @IsOptional()
    conditions: string;

    @ApiProperty({
        example: 'Canon EOS R5, объективы 24-70, 70-200',
        nullable: true
    })
    @IsString()
    @IsOptional()
    equipment: string;

    @ApiProperty({ example: ['Москва', 'Санкт-Петербург', 'Екатеринбург'] })
    @IsArray()
    @IsString({ each: true })
    geography: string[];

    @ApiProperty({ example: ['Русский', 'Английский'] })
    @IsArray()
    @IsString({ each: true })
    languages: string[];

    @ApiProperty({
        example: 'Профессиональный фотограф с 10-летним опытом',
        nullable: true
    })
    @IsString()
    @IsOptional()
    about: string;

    @ApiProperty({ type: LocationDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;

    @ApiProperty({ example: [1, 2] })
    @IsArray()
    proCategoryIds: number[];

    @ApiProperty({ example: [1, 2, 3] })
    @IsArray()
    specializationIds: number[];

    @ApiProperty({ type: [ProfileSocialDto] })
    @IsArray()
    socials: ProfileSocialDto[];

    @ApiProperty({ type: [TemporaryLocationDto], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TemporaryLocationDto)
    @NoDateOverlap({ message: 'Некорретные даты временных местоположений' })
    temporaryLocations: TemporaryLocationDto[];
}
