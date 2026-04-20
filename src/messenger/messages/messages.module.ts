import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatsModule } from '@messenger/chats/chats.module';
import { UsersModule } from '@users/users.module';

import { Message } from './entities/message.entity';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Message]),
        forwardRef(() => ChatsModule),
        forwardRef(() => UsersModule)
    ],
    controllers: [MessagesController],
    providers: [MessagesService],
    exports: [MessagesService]
})
export class MessagesModule {}
