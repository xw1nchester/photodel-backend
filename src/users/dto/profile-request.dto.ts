import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class ProfileSocialDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'https://instagram.com/user' })
    value: string;
}

export class ProfileRequestDto {
    @ApiPropertyOptional({ example: '5000' })
    @IsOptional()
    @IsString()
    price?: string;

    @ApiPropertyOptional({ example: 'Только на условиях предоплаты' })
    @IsOptional()
    @IsString()
    conditions?: string;

    @ApiPropertyOptional({ example: 'Canon EOS R5, объективы 24-70, 70-200' })
    @IsOptional()
    @IsString()
    equipment?: string;

    @ApiPropertyOptional({ example: ['Москва', 'Санкт-Петербург', 'Екатеринбург'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    geography?: string[];

    @ApiPropertyOptional({ example: ['Русский', 'Английский'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    languages?: string[];

    @ApiPropertyOptional({ example: 'Профессиональный фотограф с 10-летним опытом' })
    @IsOptional()
    @IsString()
    about?: string;

    @ApiPropertyOptional({ example: [1, 2] })
    @IsOptional()
    @IsArray()
    proCategoryIds?: number[];

    @ApiPropertyOptional({ example: [1, 2, 3] })
    @IsOptional()
    @IsArray()
    specializationIds?: number[];

    @ApiPropertyOptional({ type: [ProfileSocialDto] })
    @IsOptional()
    @IsArray()
    socials?: ProfileSocialDto[];
}
