import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateNameRequestDto {
    @ApiProperty({ example: 'Иван' })
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Петров' })
    @IsString()
    lastName: string;
}
