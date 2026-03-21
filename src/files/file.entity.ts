import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn
} from 'typeorm';

import { User } from '@users/entities/user.entity';

@Entity('files')
export class File {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column({ name: 'original_name' })
    originalName: string;

    @Column({ name: 'mime_type' })
    mimeType: string;

    @Column()
    size: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, user => user.albums, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
