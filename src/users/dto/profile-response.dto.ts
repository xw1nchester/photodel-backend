import { ApiProperty } from '@nestjs/swagger';

import { LocationResponseDto } from '@locations/dto/location-response.dto';
import { ProCategoryDto } from '@pro-categories/dto/pro-categories-response.dto';
import { FavoritesResponseDto } from '@shared/dto/favorites-response.dto';
import { LikesResponseDto } from '@shared/dto/likes-response.dto';
import { SpecializationDto } from '@specializations/dto/specializations-response.dto';

export class SocialResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Instagram.svg' })
    icon: string;

    @ApiProperty({ example: 'Instagram' })
    name: string;

    @ApiProperty({ example: 'https://instagram.com/user' })
    value: string;
}

export class TemporaryLocationResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: '2024-06-01' })
    startDate: string;

    @ApiProperty({ example: '2024-08-31' })
    endDate: string;

    @ApiProperty({ type: LocationResponseDto })
    location: LocationResponseDto;

    @ApiProperty({ example: 'Отпуск в Италии', nullable: true })
    comment: string | null;
}

// TODO: OwnProfileResponseDto / PublicProfileResponseDto
export class ProfileResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Иван' })
    firstName: string;

    @ApiProperty({ example: 'Петров' })
    lastName: string;

    @ApiProperty({
        example:
            'http://localhost:9000/uploads/e7cb06e8-1335-4b5c-bb46-0edfd4015aa1.jpeg'
    })
    avatar: string;

    @ApiProperty({ example: false })
    isProfessional: boolean;

    @ApiProperty({ example: false })
    isPro: boolean;

    @ApiProperty({ type: FavoritesResponseDto })
    favorites: FavoritesResponseDto;

    @ApiProperty({ type: LikesResponseDto })
    likes: LikesResponseDto;

    @ApiProperty({ example: '2026-02-15T15:31:31.992Z' })
    createdAt: string;

    @ApiProperty({ example: 'Свободен', nullable: true })
    status: string | null;

    @ApiProperty({ example: '5000', nullable: true })
    price: string | null;

    @ApiProperty({ example: 'Только на условиях предоплаты', nullable: true })
    conditions: string | null;

    @ApiProperty({
        example: 'Canon EOS R5, объективы 24-70, 70-200',
        nullable: true
    })
    equipment: string | null;

    @ApiProperty({ example: ['Москва', 'Санкт-Петербург', 'Екатеринбург'] })
    geography: string[];

    @ApiProperty({ example: ['Русский', 'Английский'] })
    languages: string[];

    @ApiProperty({
        example: 'Профессиональный фотограф с 10-летним опытом',
        nullable: true
    })
    about: string | null;

    @ApiProperty({ type: LocationResponseDto })
    location: LocationResponseDto;

    @ApiProperty({ type: LocationResponseDto, nullable: true })
    activeTemporaryLocation: LocationResponseDto | null;

    @ApiProperty({ type: [ProCategoryDto] })
    proCategories: ProCategoryDto[];

    @ApiProperty({ type: [SpecializationDto] })
    specializations: SpecializationDto[];

    @ApiProperty({ type: [SocialResponseDto] })
    socials: SocialResponseDto[];

    @ApiProperty({ type: [TemporaryLocationResponseDto] })
    temporaryLocations: TemporaryLocationResponseDto[];
}

export class ProfileWrapperResponseDto {
    @ApiProperty({ type: ProfileResponseDto })
    profile: ProfileResponseDto;
}

export class ProfileBasicResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Иван' })
    firstName: string;

    @ApiProperty({ example: 'Петров' })
    lastName: string;

    @ApiProperty({ example: 'e7cb06e8-1335-4b5c-bb46-0edfd4015aa1.jpeg' })
    avatarKey: string;

    @ApiProperty({
        example:
            'http://localhost:9000/uploads/e7cb06e8-1335-4b5c-bb46-0edfd4015aa1.jpeg'
    })
    avatarUrl: string;

    @ApiProperty({ example: false })
    isPro: boolean;

    @ApiProperty({ type: [ProCategoryDto] })
    proCategories: ProCategoryDto[];

    @ApiProperty({ type: [SpecializationDto] })
    specializations: SpecializationDto[];

    @ApiProperty({ type: LocationResponseDto })
    location: LocationResponseDto;

    @ApiProperty({ example: 7.5 })
    distance: number;

    @ApiProperty({ type: FavoritesResponseDto })
    favorites: FavoritesResponseDto;

    @ApiProperty({ type: LikesResponseDto })
    likes: LikesResponseDto;
}
