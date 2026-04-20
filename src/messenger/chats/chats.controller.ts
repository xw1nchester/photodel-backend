import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiExtraModels,
    ApiOkResponse,
    ApiTags,
    getSchemaPath
} from '@nestjs/swagger';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';
import { MessageRequestDto } from '@messenger/messages/dto/message-request.dto';
import {
    MessageResponseDto,
    MessageWrapperResponseDto
} from '@messenger/messages/dto/message-response.dto';
import { MessagesService } from '@messenger/messages/messages.service';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginationResponseDto } from '@shared/dto/pagination-response.dto';

import { ChatsService } from './chats.service';
import {
    ChatResponseDto,
    ChatWrapperResponseDto,
    UnreadCountResponseDto
} from './dto/chat-response.dto';

@ApiTags('Messenger')
@Controller('chats')
export class ChatsController {
    constructor(
        private readonly chatsService: ChatsService,
        private readonly messagesService: MessagesService
    ) {}

    @Post(':id/messages')
    @ApiBearerAuth()
    @ApiOkResponse({ type: MessageWrapperResponseDto })
    async sendMessage(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload,
        @Body() dto: MessageRequestDto
    ) {
        return await this.messagesService.createMessageByChatId(
            user.id,
            id,
            dto
        );
    }

    @Get()
    @ApiBearerAuth()
    @ApiExtraModels(PaginationResponseDto, ChatResponseDto)
    @ApiOkResponse({
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: getSchemaPath(ChatResponseDto) }
                        }
                    }
                },
                { $ref: getSchemaPath(PaginationResponseDto) }
            ]
        }
    })
    async findUserChats(
        @CurrentUser() user: JwtPayload,
        @Query() query: PaginationQueryDto
    ) {
        return await this.chatsService.findUserChats(
            user.id,
            query.page,
            query.limit
        );
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: ChatWrapperResponseDto })
    async findUserChatById(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.chatsService.findUserChatById(id, user.id);
    }

    @Get(':id/messages')
    @ApiBearerAuth()
    @ApiExtraModels(PaginationResponseDto, MessageResponseDto)
    @ApiOkResponse({
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: getSchemaPath(MessageResponseDto) }
                        }
                    }
                },
                { $ref: getSchemaPath(PaginationResponseDto) }
            ]
        }
    })
    async findChatMessages(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.messagesService.findChatMessages(id, user.id);
    }

    // TODO: как вариант, присоединить к запросу me,
    // а также добавить туда кол-во запросов на съемку, обучение итд
    // либо сделать отдельный stats запрос
    @Get('unread/count')
    @ApiBearerAuth()
    @ApiOkResponse({ type: UnreadCountResponseDto })
    async getUnreadChatsCount(@CurrentUser() user: JwtPayload) {
        return await this.chatsService.getUnreadChatsCount(user.id);
    }

    // read all messages?
}
