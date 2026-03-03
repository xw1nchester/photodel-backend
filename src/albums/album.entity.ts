import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinColumn,
    UpdateDateColumn
} from 'typeorm';

import { Photo } from '@photos/photo.entity';
import { User } from '@users/entities/user.entity';

@Entity('albums')
export class Album {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    // TODO: как вариант, сделать поле mainPhoto через связь с фото
    @Column({ nullable: true })
    image: string;

    @Column({ name: 'is_published', default: false })
    isPublished: boolean;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, user => user.albums, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToMany(() => Photo, photo => photo.albums)
    photos: Photo[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
