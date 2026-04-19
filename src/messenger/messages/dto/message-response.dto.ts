import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { UserShortResponseDto } from '@users/dto/user-response.dto';

export class MessageResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Ку' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ type: UserShortResponseDto })
    sender: UserShortResponseDto;

    @ApiProperty({ example: '2026-02-28T17:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: '2026-02-28T17:00:00.000Z' })
    updatedAt: string;
}

export class MessageWrapperResponseDto {
    @ApiProperty({ type: MessageResponseDto })
    message: MessageResponseDto;
}
