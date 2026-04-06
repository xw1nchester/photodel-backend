import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';

import { User } from '@users/entities/user.entity';

export enum TeamRequestStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected'
}

@Entity('team_requests')
// @Unique(['sender_user_id', 'reciever_user_id']) // чтобы не было дубликатов A->B и B->A
export class TeamRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'sender_user_id' })
    senderUserId: number;

    @Column({ name: 'receiver_user_id' })
    receiverUserId: number;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'sender_user_id' })
    senderUser: User;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'receiver_user_id' })
    receiverUser: User;

    @Column({
        type: 'enum',
        enum: TeamRequestStatus,
        default: TeamRequestStatus.PENDING
    })
    status: TeamRequestStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
