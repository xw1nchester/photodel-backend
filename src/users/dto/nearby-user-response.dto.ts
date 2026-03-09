import { ApiProperty } from '@nestjs/swagger';

export class NearbyUserResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Иван' })
    firstName: string;

    @ApiProperty({ example: 'Петров' })
    lastName: string;

    @ApiProperty({
        example: 'http://localhost:9000/uploads/e7cb06e8-1335-4b5c-bb46-0edfd4015aa1.jpeg',
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
