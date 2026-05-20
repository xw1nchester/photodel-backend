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

import { Album } from '@albums/album.entity';
import { Location } from '@locations/entities/location.entity';
import { Specialization } from '@specializations/specialization.entity';
import { User } from '@users/entities/user.entity';

@Entity('photos')
export class Photo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'image_key' })
    imageKey: string;

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
    aperture: string;

    @Column({ name: 'focal_length', nullable: true })
    focalLength: string;

    @Column({ name: 'shutter_speed', nullable: true })
    shutterSpeed: string;

    @Column({ nullable: true })
    iso: number;

    @Column({ nullable: true })
    flash: string;

    @Column({ name: 'is_for_sale', default: false })
    isForSale: boolean;

    @Column({ name: 'is_published', default: false })
    isPublished: boolean;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, user => user.photos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToMany(() => Specialization, specialization => specialization.photos)
    @JoinTable({
        name: 'photos_specializations',
        joinColumn: {
            name: 'photo_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'specialization_id',
            referencedColumnName: 'id'
        }
    })
    specializations: Specialization[];

    @ManyToMany(() => Album, album => album.photos)
    @JoinTable({
        name: 'photos_albums',
        joinColumn: {
            name: 'photo_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'album_id',
            referencedColumnName: 'id'
        }
    })
    albums: Album[];

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
