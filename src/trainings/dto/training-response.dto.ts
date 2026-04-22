import { ApiProperty } from '@nestjs/swagger';

import { FileBasicResponseDto } from '@files/dto/files-response.dto';
import { LocationResponseDto } from '@locations/dto/location-response.dto';
import { FavoritesResponseDto } from '@shared/dto/favorites-response.dto';
import { LikesResponseDto } from '@shared/dto/likes-response.dto';
import { ReviewsResponseDto } from '@shared/dto/reviews-response.dto';
import { UserShortResponseDto } from '@users/dto/user-response.dto';

export class TrainingResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ type: [FileBasicResponseDto] })
    photos: FileBasicResponseDto[];

    @ApiProperty({ example: 'Мастер-класс по портретной съёмке' })
    name: string;

    @ApiProperty({
        example: 'Обучение основам портретной фотографии',
        nullable: true
    })
    description?: string;

    @ApiProperty({ type: LocationResponseDto })
    location: LocationResponseDto;

    @ApiProperty({ example: 'Мастер-класс' })
    type: string;

    @ApiProperty({ example: 'Оффлайн' })
    format: string;

    @ApiProperty({ example: '2024-06-01' })
    startDate: string;

    @ApiProperty({ example: '2024-08-31' })
    endDate: string;

    @ApiProperty({ example: '5000 руб.' })
    price: string;

    @ApiProperty({ example: '1000 руб.' })
    prepayment: string;

    @ApiProperty({ example: 10 })
    maxParticipants: number;

    @ApiProperty({ example: true })
    isPublished: boolean;

    @ApiProperty({ type: [UserShortResponseDto] })
    team: number[];

    @ApiProperty({ type: [UserShortResponseDto] })
    organizers: number[];

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

export class TrainingWrapperResponseDto {
    @ApiProperty({ type: TrainingResponseDto })
    training: TrainingResponseDto;
}

export class TrainingBasicResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ type: FileBasicResponseDto })
    preview: FileBasicResponseDto;

    @ApiProperty({ example: 'Предсвадебная фотосессия Овечкиных' })
    name: string;

    @ApiProperty({ type: LocationResponseDto })
    location: LocationResponseDto;

    @ApiProperty({ example: 'Оффлайн' })
    format: string;

    @ApiProperty({ example: '2024-06-01' })
    startDate: string;

    @ApiProperty({ example: '2024-08-31' })
    endDate: string;

    @ApiProperty({ example: '5000 руб.' })
    price: string;

    @ApiProperty({ type: UserShortResponseDto })
    user: UserShortResponseDto;

    @ApiProperty({ type: FavoritesResponseDto })
    favorites: FavoritesResponseDto;

    @ApiProperty({ type: LikesResponseDto })
    likes: LikesResponseDto;

    @ApiProperty({ type: ReviewsResponseDto })
    reviews: ReviewsResponseDto;
}
