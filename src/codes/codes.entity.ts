import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';

import { User } from '@users/entities/users.entity';

import { CodeType } from './enums';

@Entity('codes')
export class Code {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: CodeType
    })
    type: CodeType;

    @Column()
    code: string;

    @Column({ name: 'retry_date' })
    retryDate: Date;

    @Column({ name: 'expiry_date' })
    expiryDate: Date;

    @ManyToOne(() => User, user => user.codes, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
