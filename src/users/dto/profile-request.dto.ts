import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class ProfileSocialDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'https://instagram.com/user' })
    value: string;
}

export class ProfileRequestDto {
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

    @ApiProperty({ example: [1, 2] })
    @IsArray()
    proCategoryIds: number[];

    @ApiProperty({ example: [1, 2, 3] })
    @IsArray()
    specializationIds: number[];

    @ApiProperty({ type: [ProfileSocialDto] })
    @IsArray()
    socials: ProfileSocialDto[];
}
