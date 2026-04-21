import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

import { Chat } from '@messenger/chats/entities/chat.entity';
import { User } from '@users/entities/user.entity';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    // TODO: виджет

    @Column({ name: 'sender_id' })
    senderId: number;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'sender_id' })
    sender: User;

    @Column({ name: 'chat_id' })
    chatId: number;

    @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chat_id' })
    chat: Chat;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}
