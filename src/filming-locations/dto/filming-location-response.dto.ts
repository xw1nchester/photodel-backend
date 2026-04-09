import { ApiProperty } from '@nestjs/swagger';

import { FileBasicResponseDto } from '@files/dto/files-response.dto';
import { LocationResponseDto } from '@locations/dto/location-response.dto';
import { FavoritesResponseDto } from '@shared/dto/favorites-response.dto';
import { LikesResponseDto } from '@shared/dto/likes-response.dto';
import { ReviewsResponseDto } from '@shared/dto/reviews-response.dto';
import { SpecializationDto } from '@specializations/dto/specializations-response.dto';
import { UserShortResponseDto } from '@users/dto/user-response.dto';

export class FilmingLocationResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ type: [FileBasicResponseDto] })
    photos: FileBasicResponseDto[];

    @ApiProperty({ example: 'ВДНХ' })
    name: string;

    @ApiProperty({
        example: 'Большая территория, красивая архитектура.'
    })
    description: string;

    @ApiProperty({ type: LocationResponseDto })
    location: LocationResponseDto;

    @ApiProperty({ example: 'Canon EOS 5D Mark IV', nullable: true })
    camera: string;

    @ApiProperty({ example: '5000', nullable: true })
    price: string;

    @ApiProperty({ example: 'По предоплате', nullable: true })
    conditions: string;

    @ApiProperty({ example: true })
    isPublished: boolean;

    @ApiProperty({ type: [SpecializationDto] })
    specializations: SpecializationDto[];

    @ApiProperty({ example: '2026-02-28T17:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: '2026-02-28T17:00:00.000Z' })
    updatedAt: string;

    @ApiProperty({ type: UserShortResponseDto })
    user: UserShortResponseDto;

    @ApiProperty({ type: FavoritesResponseDto })
    favorites: FavoritesResponseDto;

    @ApiProperty({ type: LikesResponseDto })
    likes: LikesResponseDto;

    @ApiProperty({ type: ReviewsResponseDto })
    reviews: ReviewsResponseDto;
}

export class FilmingLocationWrapperResponseDto {
    @ApiProperty({ type: FilmingLocationResponseDto })
    filmingLocation: FilmingLocationResponseDto;
}

export class FilmingLocationBasicResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ type: FileBasicResponseDto })
    preview: FileBasicResponseDto;

    @ApiProperty({ example: 'ВДНХ' })
    name: string;

    @ApiProperty({ type: LocationResponseDto })
    location: LocationResponseDto;

    @ApiProperty({ type: UserShortResponseDto })
    user: UserShortResponseDto;

    @ApiProperty({ type: FavoritesResponseDto })
    favorites: FavoritesResponseDto;

    @ApiProperty({ type: LikesResponseDto })
    likes: LikesResponseDto;

    @ApiProperty({ type: ReviewsResponseDto })
    reviews: ReviewsResponseDto;
}
