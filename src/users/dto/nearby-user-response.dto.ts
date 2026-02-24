import { ApiProperty } from '@nestjs/swagger';

export class NearbyUserResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Иван' })
    firstName: string;

    @ApiProperty({ example: 'Петров' })
    lastName: string;

    @ApiProperty({
        example: 'https://avatars.githubusercontent.com/u/63304397',
        nullable: true
    })
    avatar: string;

    @ApiProperty({ example: 1.5 })
    distance: number;
}

export class NearbyUsersWrapperResponseDto {
    @ApiProperty({ type: [NearbyUserResponseDto] })
    users: NearbyUserResponseDto[];
}
