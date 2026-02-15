import { User } from '@users/users.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('refresh_tokens')
export class Token {
    @PrimaryColumn({ unique: true })
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
