import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

import { File } from '@files/file.entity';
import { Location } from '@locations/entities/location.entity';
import { Specialization } from '@specializations/specialization.entity';
import { User } from '@users/entities/user.entity';

@Entity('photo_sessions')
export class PhotoSession {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => Location, {
        cascade: true,
        nullable: true,
        onDelete: 'SET NULL'
    })
    @JoinColumn({ name: 'location_id' })
    location: Location;

    @Column({ name: 'start_date', type: 'date' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date' })
    endDate: Date;

    @Column({ name: 'specialization_id', nullable: true })
    specializationId: number;

    @ManyToOne(() => Specialization, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'specialization_id' })
    specialization: Specialization;

    @Column({ name: 'is_published', default: false })
    isPublished: boolean;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, user => user.photos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToMany(() => File)
    @JoinTable({
        name: 'photo_session_files',
        joinColumn: {
            name: 'photo_session_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'file_id',
            referencedColumnName: 'id'
        }
    })
    files: File[];

    @ManyToMany(() => User)
    @JoinTable({
        name: 'photo_session_team',
        joinColumn: {
            name: 'photo_session_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        }
    })
    team: User[];

    @Column({ name: 'preview_file_id', nullable: true })
    previewFileId: number;

    @ManyToOne(() => File, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'preview_file_id' })
    previewFile: File;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // вычисляемые поля
    isFavorite?: boolean;
    favoriteId?: number;
    favoritesCount?: number;
    isLiked?: boolean;
    likeId?: number;
    likesCount?: number;
    reviewsCount?: number;
}
