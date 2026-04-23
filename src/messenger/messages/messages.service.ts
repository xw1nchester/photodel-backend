import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { FilesService } from '@files/files.service';
import { ChatsService } from '@messenger/chats/chats.service';
import { createUserDto } from '@shared/mappers/user.mapper';
import { UsersService } from '@users/users.service';

import { MessageRequestDto } from './dto/message-request.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Message)
        private readonly messagesRepository: Repository<Message>,
        private readonly chatsService: ChatsService,
        private readonly usersService: UsersService,
        private readonly filesService: FilesService
    ) {}

    createDto(message: Message) {
        const avatarUrl = message.sender.avatarKey
            ? this.filesService.getUrl(message.sender.avatarKey)
            : null;

        const sender = createUserDto(message.sender, avatarUrl);

        const isDeleted = !!message.deletedAt;

        return {
            id: message.id,
            content: isDeleted ? 'Сообщение удалено' : message.content,
            sender,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
            isRead: message.isRead,
            isDeleted
        };
    }

    async getDtoById(id: number, manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(Message)
            : this.messagesRepository;

        const message = await repo.findOne({
            where: { id },
            relations: { sender: true }
        });

        return this.createDto(message);
    }

    async createMessageByUserId(
        senderUserId: number,
        receiverUserId: number,
        dto: MessageRequestDto
    ) {
        if (senderUserId == receiverUserId) {
            throw new BadRequestException(
                'Нельзя отправить сообщение самому себе'
            );
        }

        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(Message);

            const isRecieverExists =
                await this.usersService.exists(receiverUserId);

            if (!isRecieverExists) {
                throw new NotFoundException('Пользователь не найден');
            }

            let chat = await this.chatsService.findPrivateChat(
                senderUserId,
                receiverUserId,
                manager
            );

            if (!chat) {
                chat = await this.chatsService.createChat(
                    [senderUserId, receiverUserId],
                    manager
                );
            }

            const createdMessage = await repo.save({
                chatId: chat.id,
                senderId: senderUserId,
                content: dto.content
            });

            await this.chatsService.setLatestMessage(
                chat.id,
                createdMessage.id,
                manager
            );

            await this.chatsService.setLastReadMessage(
                chat.id,
                senderUserId,
                createdMessage.id,
                manager
            );

            return {
                message: await this.getDtoById(createdMessage.id, manager)
            };
        });
    }

    async createMessageByChatId(
        senderUserId: number,
        chatId: number,
        dto: MessageRequestDto
    ) {
        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(Message);

            const isUserInChat = await this.chatsService.isUserInChat(
                senderUserId,
                chatId,
                manager
            );

            if (!isUserInChat) {
                throw new NotFoundException('Чат не найден');
            }

            const createdMessage = await repo.save({
                chatId,
                senderId: senderUserId,
                content: dto.content
            });

            await this.chatsService.setLatestMessage(
                chatId,
                createdMessage.id,
                manager
            );

            await this.chatsService.setLastReadMessage(
                chatId,
                senderUserId,
                createdMessage.id,
                manager
            );

            return {
                message: await this.getDtoById(createdMessage.id, manager)
            };
        });
    }

    private transformRawData(entities: Message[], raw: any[]) {
        const rawMap = new Map();

        for (const r of raw) {
            rawMap.set(r.message_id, r);
        }

        return entities.map(msg => {
            const r = rawMap.get(msg.id);
            msg.isRead = r.isRead;
            return msg;
        });
    }

    // TODO: implenent pagination with cursor
    async findChatMessages(
        chatId: number,
        userId: number
        // limit = 20,
        // cursor?: Date
    ) {
        const isUserInChat = await this.chatsService.isUserInChat(
            userId,
            chatId
        );

        if (!isUserInChat) {
            throw new NotFoundException('Чат не найден');
        }

        const qb = this.messagesRepository
            .createQueryBuilder('message')
            .where('message.chatId = :chatId', { chatId })
            .leftJoinAndSelect('message.sender', 'sender')
            .innerJoin(
                'chats_members',
                'cm',
                'cm.chat_id = message.chatId AND cm.user_id = :userId',
                { userId }
            )
            .addSelect(
                `CASE 
                    WHEN message.id <= COALESCE(cm.last_read_message_id, 0)
                    THEN true 
                    ELSE false 
                END`,
                'isRead'
            )
            .orderBy('message.createdAt', 'DESC');
        // .limit(limit);

        // if (cursor) {
        //     qb.andWhere('message.createdAt < :cursor', { cursor });
        // }

        const { entities, raw } = await qb.getRawAndEntities();

        const messages = this.transformRawData(entities, raw);

        const data = messages.map(msg => this.createDto(msg));

        return { data };
    }

    async findById(id: number) {
        const message = await this.messagesRepository.findOne({
            where: { id },
            relations: { sender: true }
        });

        if (!message) {
            throw new NotFoundException('Сообщение не найдено');
        }

        return message;
    }

    async readMessage(id: number, userId: number) {
        const message = await this.findById(id);

        const isUserInChat = await this.chatsService.isUserInChat(
            userId,
            message.chatId
        );

        if (!isUserInChat) {
            throw new NotFoundException('Сообщение не найдено');
        }

        await this.chatsService.setLastReadMessage(
            message.chatId,
            userId,
            message.id
        );

        return { message: this.createDto(message) };
    }

    async deleteMessage(id: number, userId: number) {
        const message = await this.findById(id);

        const isUserInChat = await this.chatsService.isUserInChat(
            userId,
            message.chatId
        );

        if (!isUserInChat) {
            throw new NotFoundException('Сообщение не найдено');
        }

        if (message.senderId != userId) {
            throw new BadRequestException(
                'Вы можете удалять только свои сообщения'
            );
        }

        await this.messagesRepository.update(id, {
            content: '',
            deletedAt: new Date()
        });

        return { message: await this.getDtoById(id) };
    }
}
