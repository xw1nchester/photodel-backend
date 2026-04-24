import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';

import { Message } from '@messenger/messages/entities/message.entity';
import { User } from '@users/entities/user.entity';

import { Chat } from './chat.entity';

@Entity('chats_members')
export class ChatMember {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'chat_id' })
    chatId: number;

    @ManyToOne(() => Chat, chat => chat.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chat_id' })
    chat: Chat;

    @Column({ name: 'last_read_message_id', nullable: true })
    lastReadMessageId: number;

    @ManyToOne(() => Message, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'last_read_message_id' })
    lastReadMessage: Message;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'deleted_at', nullable: true, type: 'timestamptz' })
    deletedAt: Date;
}
