import { ApiProperty } from '@nestjs/swagger';

import { ProCategoryDto } from '@pro-categories/dto/pro-category.dto';
import { SpecializationDto } from '@specializations/dto/specialization.dto';

export class SocialResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Instagram' })
    name: string;

    @ApiProperty({ example: 'https://instagram.com/user' })
    value: string;
}

export class ProfileResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: '5000', nullable: true })
    price: string | null;

    @ApiProperty({ example: 'Только на условиях предоплаты', nullable: true })
    conditions: string | null;

    @ApiProperty({ example: 'Canon EOS R5, объективы 24-70, 70-200', nullable: true })
    equipment: string | null;

    @ApiProperty({ example: ['Москва', 'Санкт-Петербург', 'Екатеринбург'] })
    geography: string[];

    @ApiProperty({ example: ['Русский', 'Английский'] })
    languages: string[];

    @ApiProperty({ example: 'Профессиональный фотограф с 10-летним опытом', nullable: true })
    about: string | null;

    @ApiProperty({ type: [ProCategoryDto] })
    proCategories: ProCategoryDto[];

    @ApiProperty({ type: [SpecializationDto] })
    specializations: SpecializationDto[];

    @ApiProperty({ type: [SocialResponseDto] })
    socials: SocialResponseDto[];
}
