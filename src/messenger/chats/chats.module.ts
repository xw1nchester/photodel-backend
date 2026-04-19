import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessagesModule } from '@messenger/messages/messages.module';

import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { ChatMember } from './entities/chat-members.entity';
import { Chat } from './entities/chat.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Chat, ChatMember]),
        forwardRef(() => MessagesModule)
    ],
    controllers: [ChatsController],
    providers: [ChatsService],
    exports: [ChatsService]
})
export class ChatsModule {}
