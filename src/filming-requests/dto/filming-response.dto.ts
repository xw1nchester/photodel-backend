import { ApiProperty } from '@nestjs/swagger';

import { FilmingRequestStatus } from '@filming-requests/filming-requests.entity';
import { LocationResponseDto } from '@locations/dto/location-response.dto';
import { UserShortResponseDto } from '@users/dto/user-response.dto';

class FilmingRequestResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ type: () => UserShortResponseDto })
    user: UserShortResponseDto;

    @ApiProperty({
        enum: FilmingRequestStatus,
        example: FilmingRequestStatus.PENDING
    })
    status: FilmingRequestStatus;

    @ApiProperty({
        type: String,
        format: 'date-time'
    })
    date: Date;

    @ApiProperty({ example: 1 })
    durationHours: number;

    @ApiProperty({ type: LocationResponseDto })
    location: LocationResponseDto;

    @ApiProperty({ example: 'Архитектура' })
    type: string;

    @ApiProperty({ example: 1 })
    peoplesCount: number;

    @ApiProperty({ example: '500 рублей' })
    budget: string;

    @ApiProperty({ example: false })
    needsMakeupArtist: boolean;

    @ApiProperty({ example: 'Коммент' })
    comment: string;

    @ApiProperty({ example: '2026-02-28T17:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: '2026-02-28T17:00:00.000Z' })
    updatedAt: string;
}

export class FilmingRequestWrapperResponseDto {
    @ApiProperty({ type: FilmingRequestResponseDto, isArray: true })
    filmingRequests: FilmingRequestResponseDto[];
}
