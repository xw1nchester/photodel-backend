import { ApiProperty } from '@nestjs/swagger';

import { LocationResponseDto } from '@locations/dto/location-response.dto';
import { FavoritesResponseDto } from '@shared/dto/favorites-response.dto';
import { SpecializationDto } from '@specializations/dto/specializations-response.dto';
import { UserShortResponseDto } from '@users/dto/user-response.dto';

export class PhotoMinResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'e7cb06e8-1335-4b5c-bb46-0edfd4015aa1.jpeg' })
    key: string;

    @ApiProperty({
        example:
            'http://localhost:9000/uploads/e7cb06e8-1335-4b5c-bb46-0edfd4015aa1.jpeg'
    })
    url: string;
}

export class FilmingLocationResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ type: [PhotoMinResponseDto] })
    photos: PhotoMinResponseDto[];

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
}

export class FilmingLocationWrapperResponseDto {
    @ApiProperty({ type: FilmingLocationResponseDto })
    filmingLocation: FilmingLocationResponseDto;
}
