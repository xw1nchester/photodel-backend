import { ApiProperty } from '@nestjs/swagger';

import { FileBasicResponseDto } from '@files/dto/files-response.dto';
import { LocationResponseDto } from '@locations/dto/location-response.dto';
import { FavoritesResponseDto } from '@shared/dto/favorites-response.dto';
import { LikesResponseDto } from '@shared/dto/likes-response.dto';
import { ReviewsResponseDto } from '@shared/dto/reviews-response.dto';
import { SpecializationDto } from '@specializations/dto/specializations-response.dto';
import { UserShortResponseDto } from '@users/dto/user-response.dto';

export class PhotoSessionResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ type: [FileBasicResponseDto] })
    photos: FileBasicResponseDto[];

    @ApiProperty({ example: 'Предсвадебная фотосессия Овечкиных' })
    name: string;

    @ApiProperty({
        example: 'Вот и отгремела, пожалуй, самая ожидаемая и громкая свадьба',
        nullable: true
    })
    description?: string;

    @ApiProperty({ type: LocationResponseDto })
    location: LocationResponseDto;

    @ApiProperty({ example: '2024-06-01' })
    startDate: string;

    @ApiProperty({ example: '2024-08-31' })
    endDate: string;

    @ApiProperty({ type: SpecializationDto })
    specialization: SpecializationDto;

    @ApiProperty({ example: true })
    isPublished: boolean;

    @ApiProperty({ type: [UserShortResponseDto] })
    team: number[];

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

export class PhotoSessionWrapperResponseDto {
    @ApiProperty({ type: PhotoSessionResponseDto })
    photoSession: PhotoSessionResponseDto;
}

export class PhotoSessionBasicResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ type: FileBasicResponseDto })
    preview: FileBasicResponseDto;

    @ApiProperty({ example: 'Предсвадебная фотосессия Овечкиных' })
    name: string;

    @ApiProperty({ type: LocationResponseDto })
    location: LocationResponseDto;

    @ApiProperty({ type: FavoritesResponseDto })
    favorites: FavoritesResponseDto;

    @ApiProperty({ type: LikesResponseDto })
    likes: LikesResponseDto;

    @ApiProperty({ type: ReviewsResponseDto })
    reviews: ReviewsResponseDto;
}
