import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MessageRequestDto {
    @ApiProperty({ example: 'Ку' })
    @IsString()
    @IsNotEmpty()
    content: string;
}
