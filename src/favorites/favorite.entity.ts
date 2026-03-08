import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique
} from 'typeorm';

import { User } from '@users/entities/user.entity';

import { FavoriteEntityType } from './enums';

@Entity('favorites')
@Unique('favorites_unique', ['userId', 'entityType', 'entityId'])
export class Favorite {
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
        enum: FavoriteEntityType
    })
    entityType: FavoriteEntityType;

    @Column({ name: 'entity_id' })
    entityId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
