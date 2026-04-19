import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

import { Message } from '@messenger/messages/entities/message.entity';

import { ChatMember } from './chat-members.entity';

@Entity('chats')
export class Chat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'latest_message_id', nullable: true })
    latestMessageId: number;

    @ManyToOne(() => Message, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'latest_message_id' })
    latestMessage: Message;

    @OneToMany(() => ChatMember, member => member.chat, { cascade: true })
    members: ChatMember[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
