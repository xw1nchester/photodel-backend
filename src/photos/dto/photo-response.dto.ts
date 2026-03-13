import { ApiProperty } from '@nestjs/swagger';

import { AlbumResponseDto } from '@albums/dto/album-response.dto';
import { LocationDto } from '@locations/dto/location.dto';
import { FavoritesResponseDto } from '@shared/dto/favorites-response.dto';
import { SpecializationDto } from '@specializations/dto/specializations-response.dto';
import { UserBasicDto } from '@users/dto/user-response.dto';

export class PhotoResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'e7cb06e8-1335-4b5c-bb46-0edfd4015aa1.jpeg' })
    imageKey: string;

    @ApiProperty({
        example:
            'http://localhost:9000/uploads/e7cb06e8-1335-4b5c-bb46-0edfd4015aa1.jpeg'
    })
    imageUrl: string;

    @ApiProperty({ example: 'Моя фотография' })
    name: string;

    @ApiProperty({ example: 'Описание фотографии', nullable: true })
    description: string;

    @ApiProperty({ type: LocationDto, nullable: true })
    location: LocationDto;

    @ApiProperty({ example: 'Canon EOS 5D Mark IV', nullable: true })
    camera: string;

    @ApiProperty({ example: 'f/2.8', nullable: true })
    aperture: string;

    @ApiProperty({ example: '50mm', nullable: true })
    focalLength: string;

    @ApiProperty({ example: '1/200s', nullable: true })
    shutterSpeed: string;

    @ApiProperty({ example: 400, nullable: true })
    iso: number;

    @ApiProperty({ example: 'On', nullable: true })
    flash: string;

    @ApiProperty({ example: true })
    isForSale: boolean;

    @ApiProperty({ example: true })
    isPublished: boolean;

    // @ApiProperty({ example: 1 })
    // userId: number;

    @ApiProperty({ type: [SpecializationDto] })
    specializations: SpecializationDto[];

    @ApiProperty({ type: [AlbumResponseDto] })
    albums: AlbumResponseDto[];

    @ApiProperty({ example: '2026-02-28T17:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: '2026-02-28T17:00:00.000Z' })
    updatedAt: string;

    @ApiProperty({ type: UserBasicDto })
    user: UserBasicDto;

    @ApiProperty({ type: FavoritesResponseDto })
    favorites: FavoritesResponseDto;
}

export class PhotoWrapperResponseDto {
    @ApiProperty({ type: PhotoResponseDto })
    photo: PhotoResponseDto;
}
