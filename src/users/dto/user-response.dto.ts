import { LocationResponseDto } from '@locations/dto/location-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserMeResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'ivan.petrov@example.com' })
    email: string;

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

    @ApiProperty({ example: true })
    isAdult: boolean;

    // исполнитель / клиент
    @ApiProperty({ example: false })
    isProfessional: boolean;

    @ApiProperty({ example: false })
    isVerified: boolean;

    // подписка
    @ApiProperty({ example: false })
    isPro: boolean;

    @ApiProperty({ example: '2026-02-15T15:31:31.992Z' })
    createdAt: string;

    @ApiProperty({ example: ['MODERATOR'] })
    roles: string[];

    @ApiProperty({ type: LocationResponseDto })
    location: LocationResponseDto;
}

export class UserMeWrapperResponseDto {
    @ApiProperty({ type: UserMeResponseDto })
    user: UserMeResponseDto;
}

export class UserShortResponseDto {
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
}
