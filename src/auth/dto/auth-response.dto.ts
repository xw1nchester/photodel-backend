import { ApiProperty } from '@nestjs/swagger';

// TODO: мб стоит юзать класс UserDto?
export class UserResponseDto {
    id: number;

    @ApiProperty({ example: 'ivan.petrov@example.com' })
    email: string;

    firstName: string;

    lastName: string;

    @ApiProperty({ example: '+7 (912) 345-67-89', nullable: true })
    phone: string | null;

    @ApiProperty({ example: true })
    isAdult: boolean;

    @ApiProperty({ example: false })
    isProfessional: boolean;

    @ApiProperty({ example: false })
    isVerified: boolean;

    @ApiProperty({ example: '2026-02-15T15:31:31.992Z' })
    createdAt: string;
}

export class AuthResponseDto {
    @ApiProperty({
        type: UserResponseDto
    })
    user: UserResponseDto;

    @ApiProperty({
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzY0MTY5NDkyLCJleHAiOjE3NjQxNjk3OTJ9.Kh8qZxD9zXhP2bU2kjJ8b_RtV2gOoPDr2mPjLq7aB7E'
    })
    accessToken: string;
}
