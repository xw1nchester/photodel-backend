import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';

import { User } from '@users/entities/users.entity';

@Entity('refresh_tokens')
export class Token {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    token: string;

    @Column({ name: 'expiry_date' })
    expiryDate: Date;

    @Column({ name: 'user_agent' })
    userAgent: string;

    @ManyToOne(() => User, user => user.tokens, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
