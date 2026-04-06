import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class TeamRequestDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    userId: number;
}
