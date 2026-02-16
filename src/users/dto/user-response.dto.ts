import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'ivan.petrov@example.com' })
    email: string;

    @ApiProperty({ example: 'Иван' })
    firstName: string;
    
    @ApiProperty({ example: 'Петров' })
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