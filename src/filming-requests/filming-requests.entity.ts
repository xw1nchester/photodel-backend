import { Location } from '@locations/entities/location.entity';
import { User } from '@users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

export enum FilmingRequestStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    COMPLETED = 'completed'
}

@Entity('filming_requests')
export class FilmingRequest {
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

    @Column({
        type: 'enum',
        enum: FilmingRequestStatus,
        default: FilmingRequestStatus.PENDING
    })
    status: FilmingRequestStatus;

    @Column({ type: 'timestamptz' })
    date: Date;

    @Column({ name: 'duration_hours' })
    durationHours: number;

    @ManyToOne(() => Location, {
        cascade: true,
        nullable: true,
        onDelete: 'SET NULL'
    })
    @JoinColumn({ name: 'location_id' })
    location: Location;

    @Column()
    type: string;

    @Column({ name: 'peoples_count' })
    peoplesCount: number;

    @Column()
    budget: string;

    @Column({ name: 'needs_makeup_artist' })
    needsMakeupArtist: boolean;

    @Column()
    comment: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
