import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

import { Training } from '@trainings/training.entity';
import { User } from '@users/entities/user.entity';

export enum TrainingRequestStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    COMPLETED = 'completed'
}

@Entity('training_requests')
export class TrainingRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'sender_user_id' })
    senderUserId: number;

    @Column({ name: 'receiver_user_id' })
    receiverUserId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'sender_user_id' })
    senderUser: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'receiver_user_id' })
    receiverUser: User;

    @Column({ name: 'training_id' })
    trainingId: number;

    @ManyToOne(() => Training, tr => tr.requests)
    @JoinColumn({ name: 'training_id' })
    training: Training;

    @Column({
        type: 'enum',
        enum: TrainingRequestStatus,
        default: TrainingRequestStatus.PENDING
    })
    status: TrainingRequestStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
