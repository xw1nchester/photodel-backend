import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { MessagesService } from '@messenger/messages/messages.service';
import { PaginationDto } from '@shared/dto/pagination.dto';

import { ChatMember } from './entities/chat-members.entity';
import { Chat } from './entities/chat.entity';
import { FilesService } from '@files/files.service';

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(Chat)
        private readonly chatsRepository: Repository<Chat>,
        @InjectRepository(ChatMember)
        private readonly chatsMembersRepository: Repository<ChatMember>,
        @Inject(forwardRef(() => MessagesService))
        private readonly messagesService: MessagesService,
        private readonly filesService: FilesService
    ) {}

    async findPrivateChat(
        firstUserId: number,
        secondUserId: number,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(Chat)
            : this.chatsRepository;

        return await repo
            .createQueryBuilder('chat')
            .innerJoin('chat.members', 'member')
            .groupBy('chat.id')
            .having(
                `
                    COUNT(member.id) = 2 AND
                    SUM(CASE WHEN member.userId IN (:...userIds) THEN 1 ELSE 0 END) = 2
                `,
                { userIds: [firstUserId, secondUserId] }
            )
            .getOne();
    }

    async createChat(userIds: number[], manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(Chat)
            : this.chatsRepository;

        return await repo.save({
            members: userIds.map(userId => ({ userId }))
        });
    }

    async setLatestMessage(
        chatId: number,
        messageId: number,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(Chat)
            : this.chatsRepository;

        return await repo.update(
            { id: chatId },
            { latestMessageId: messageId }
        );
    }

    async isUserInChat(
        userId: number,
        chatId: number,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(ChatMember)
            : this.chatsMembersRepository;

        return repo.exists({ where: { userId, chatId } });
    }

    createDto(chat: Chat, requesterUserId: number) {
        const companion = chat.members.find(m => m.userId !== requesterUserId);
        let title = null,
            picture = null;

        if (companion) {
            title = `${companion.user.lastName} ${companion?.user?.firstName}`;
            picture = companion.user.avatarKey
                ? this.filesService.getUrl(companion.user.avatarKey)
                : null;
        }

        const latestMessage = this.messagesService.createDto(
            chat.latestMessage
        );

        return {
            id: chat.id,
            title,
            picture,
            latestMessage
        };
    }

    async findUserChats(userId: number, page: number, limit: number) {
        const query = this.chatsRepository
            .createQueryBuilder('chat')
            .innerJoin('chat.members', 'member', 'member.userId = :userId', {
                userId
            })
            .leftJoinAndSelect('chat.members', 'members')
            .leftJoinAndSelect('members.user', 'user')
            .leftJoinAndSelect('chat.latestMessage', 'latestMessage')
            .leftJoinAndSelect('latestMessage.sender', 'sender')
            .orderBy('latestMessage.createdAt', 'DESC', 'NULLS LAST')
            .take(limit)
            .skip((page - 1) * limit);

        const [data, totalCount] = await query.getManyAndCount();

        const dto = data.map(c => this.createDto(c, userId));

        return new PaginationDto(dto, totalCount, page, limit);
    }

    async findUserChatById(chatId: number, userId: number) {
        const chat = await this.chatsRepository
            .createQueryBuilder('chat')
            .where('chat.id = :chatId', { chatId })
            .innerJoin('chat.members', 'member', 'member.userId = :userId', {
                userId
            })
            .leftJoinAndSelect('chat.members', 'members')
            .leftJoinAndSelect('members.user', 'user')
            .leftJoinAndSelect('chat.latestMessage', 'latestMessage')
            .leftJoinAndSelect('latestMessage.sender', 'sender')
            .getOne();

        if (!chat) {
            throw new NotFoundException('Чат не найден');
        }

        return { chat: this.createDto(chat, userId) };
    }
}
