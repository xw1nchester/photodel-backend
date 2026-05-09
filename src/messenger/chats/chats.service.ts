import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { FilesService } from '@files/files.service';
import { MessagesService } from '@messenger/messages/messages.service';
import { PaginationDto } from '@shared/dto/pagination.dto';

import { ChatMember } from './entities/chat-members.entity';
import { Chat } from './entities/chat.entity';

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

    async restoreChatForAllMembers(chatId: number, manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(ChatMember)
            : this.chatsMembersRepository;

        return await repo.update({ chatId }, { deletedAt: null });
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
        let userId = null,
            title = null,
            picture = null;

        if (companion) {
            userId = companion.userId;
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
            userId,
            title,
            picture,
            latestMessage,
            unreadCount: chat.unreadCount
        };
    }

    private transformRawData(entities: Chat[], raw: any[]) {
        const rawMap = new Map();

        for (const r of raw) {
            rawMap.set(r.chat_id, r);
        }

        return entities.map(chat => {
            const r = rawMap.get(chat.id);
            chat.unreadCount = Number(r?.unreadCount || 0);
            chat.latestMessage.isRead = r.latestMessage_isRead;
            return chat;
        });
    }

    async findUserChats(userId: number, page: number, limit: number) {
        const query = this.chatsRepository
            .createQueryBuilder('chat')
            .innerJoin(
                'chat.members',
                'member',
                'member.userId = :userId AND member.deletedAt IS NULL',
                {
                    userId
                }
            )
            .leftJoinAndSelect('chat.members', 'members')
            .leftJoinAndSelect('members.user', 'user')
            .leftJoinAndSelect('chat.latestMessage', 'latestMessage')
            .leftJoinAndSelect('latestMessage.sender', 'sender')
            .leftJoin(
                'messages',
                'unreadMessages',
                `
                unreadMessages.chat_id = chat.id
                AND unreadMessages.id > COALESCE(member.last_read_message_id, 0)
                `
            )
            .addSelect('COUNT(unreadMessages.id)', 'unreadCount')
            .addSelect(
                `
                CASE 
                    WHEN latestMessage.id IS NULL THEN false
                    WHEN latestMessage.id <= COALESCE(member.last_read_message_id, 0)
                    THEN true
                    ELSE false
                END
                `,
                'latestMessage_isRead'
            )
            .groupBy('chat.id')
            .addGroupBy('member.id')
            .addGroupBy('members.id')
            .addGroupBy('user.id')
            .addGroupBy('latestMessage.id')
            .addGroupBy('sender.id')
            .orderBy('latestMessage.createdAt', 'DESC', 'NULLS LAST')
            .take(limit)
            .skip((page - 1) * limit);

        const { entities, raw } = await query.getRawAndEntities();

        const total = await query.getCount();

        const chats = this.transformRawData(entities, raw);

        const dtos = chats.map(c => this.createDto(c, userId));

        return new PaginationDto(dtos, total, page, limit);
    }

    async getDtoByIdAndUserId(chatId: number, userId: number) {
        const query = this.chatsRepository
            .createQueryBuilder('chat')
            .where('chat.id = :chatId', { chatId })
            .innerJoin('chat.members', 'member', 'member.userId = :userId', {
                userId
            })
            .leftJoinAndSelect('chat.members', 'members')
            .leftJoinAndSelect('members.user', 'user')
            .leftJoinAndSelect('chat.latestMessage', 'latestMessage')
            .leftJoinAndSelect('latestMessage.sender', 'sender')
            .leftJoin(
                'messages',
                'unreadMessages',
                `
                unreadMessages.chat_id = chat.id
                AND unreadMessages.id > COALESCE(member.last_read_message_id, 0)
                `
            )
            .addSelect('COUNT(unreadMessages.id)', 'unreadCount')
            .groupBy('chat.id')
            .addGroupBy('member.id')
            .addGroupBy('members.id')
            .addGroupBy('user.id')
            .addGroupBy('latestMessage.id')
            .addGroupBy('sender.id')
            .orderBy('latestMessage.createdAt', 'DESC', 'NULLS LAST');

        const { entities, raw } = await query.getRawAndEntities();

        const chat = this.transformRawData(entities, raw)[0];

        if (!chat) {
            throw new NotFoundException('Чат не найден');
        }

        return { chat: this.createDto(chat, userId) };
    }

    async setLastReadMessage(
        chatId: number,
        userId: number,
        lastReadMessageId: number,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(ChatMember)
            : this.chatsMembersRepository;

        return await repo.update({ chatId, userId }, { lastReadMessageId });
    }

    async getUnreadChatsCount(userId: number) {
        const count = await this.chatsMembersRepository
            .createQueryBuilder('cm')
            .innerJoin('cm.chat', 'c')
            .where('cm.userId = :userId', { userId })
            .andWhere('cm.deletedAt IS NULL')
            .andWhere(
                `(cm.lastReadMessageId IS NULL OR cm.lastReadMessageId < c.latestMessageId)`
            )
            .getCount();

        return { count };
    }

    async remove(id: number, userId: number) {
        const isUserInChat = await this.isUserInChat(userId, id);

        if (!isUserInChat) {
            throw new NotFoundException('Чат не найден');
        }

        await this.chatsMembersRepository.update(
            { chatId: id, userId },
            { deletedAt: new Date() }
        );

        return this.getDtoByIdAndUserId(id, userId);
    }
}
