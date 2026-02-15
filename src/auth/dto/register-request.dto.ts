import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, IsBoolean, MinLength } from 'class-validator';

export class RegisterRequestDto {
    @ApiProperty({ example: 'user@example.com' })
    @Transform(({ value }) => value.toLowerCase())
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Ivan' })
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Petrov' })
    @IsString()
    lastName: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    isAdult: boolean;

    @ApiProperty({ example: false })
    @IsBoolean()
    isProfessional: boolean;

    @ApiProperty({ example: 'StrongPass123!', minLength: 8 })
    @IsString()
    @MinLength(8)
    password: string;
}
