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

@Entity('filming_locations')
export class FilmingLocation {
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

    @Column({ nullable: true })
    camera: string;

    @Column({ nullable: true })
    price: string;

    @Column({ nullable: true })
    conditions: string;

    @Column({ name: 'is_published', default: false })
    isPublished: boolean;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, user => user.photos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToMany(() => Specialization, specialization => specialization.photos)
    @JoinTable({
        name: 'filming_locations_specializations',
        joinColumn: {
            name: 'filming_location_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'specialization_id',
            referencedColumnName: 'id'
        }
    })
    specializations: Specialization[];

    @ManyToMany(() => File)
    @JoinTable({
        name: 'filming_locations_files',
        joinColumn: {
            name: 'filming_location_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'file_id',
            referencedColumnName: 'id'
        }
    })
    files: File[];

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
}
