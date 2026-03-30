import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique
} from 'typeorm';

import { EntityType } from '@shared/enums/entity-type.enums';
import { User } from '@users/entities/user.entity';

@Entity('likes')
@Unique('likes_unique', ['userId', 'entityType', 'entityId'])
export class Like {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({
        name: 'entity_type',
        type: 'enum',
        enum: EntityType
    })
    entityType: EntityType;

    @Column({ name: 'entity_id' })
    entityId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
