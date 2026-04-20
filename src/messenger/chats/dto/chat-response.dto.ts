import { ApiProperty } from '@nestjs/swagger';

import { MessageResponseDto } from '@messenger/messages/dto/message-response.dto';

export class ChatResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Иванов Иван' })
    title: string;

    @ApiProperty({
        example:
            'http://localhost:9000/uploads/e7cb06e8-1335-4b5c-bb46-0edfd4015aa1.jpeg'
    })
    picture: string;

    @ApiProperty({ type: MessageResponseDto })
    latestMessage: MessageResponseDto;

    @ApiProperty({ example: 1 })
    unreadCount: number;
}

export class ChatWrapperResponseDto {
    @ApiProperty({ type: ChatResponseDto })
    chat: ChatResponseDto;
}

export class UnreadCountResponseDto {
    @ApiProperty({ example: 1 })
    count: number;
}
