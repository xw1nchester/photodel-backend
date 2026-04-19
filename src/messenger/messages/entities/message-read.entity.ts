import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';

import { User } from '@users/entities/user.entity';

import { Message } from './message.entity';

@Entity('messages_reads')
export class MessageRead {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'message_id' })
    messageId: number;

    @ManyToOne(() => Message, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'message_id' })
    message: Message;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
