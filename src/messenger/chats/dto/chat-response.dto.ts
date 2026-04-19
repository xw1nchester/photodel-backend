import { ApiProperty } from '@nestjs/swagger';

import { MessageResponseDto } from '@messenger/messages/dto/message-response.dto';

export class ChatResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Иванов Иван' })
    title: string;

    @ApiProperty({ type: MessageResponseDto })
    latestMessage: MessageResponseDto;
}

export class ChatWrapperResponseDto {
    @ApiProperty({ type: ChatResponseDto })
    chat: ChatResponseDto;
}
