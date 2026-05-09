import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
    OneToOne,
    ManyToMany,
    JoinTable
} from 'typeorm';

import { Album } from '@albums/album.entity';
import { Code } from '@codes/code.entity';
import { File } from '@files/file.entity';
import { FilmingLocation } from '@filming-locations/filming-location.entity';
import { Photo } from '@photos/photo.entity';
import { Role } from '@roles/role.entity';
import { Token } from '@tokens/token.entity';

import { Profile } from './profile.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column({ name: 'first_name' })
    firstName: string;

    @Column({ name: 'last_name' })
    lastName: string;

    @Column({ name: 'password_hash' })
    passwordHash: string;

    @Column({ name: 'is_adult' })
    isAdult: boolean;

    @Column({ name: 'is_professional' })
    isProfessional: boolean;

    @Column({ name: 'is_verified', default: false })
    isVerified: boolean;

    @Column({ name: 'is_pro', default: false })
    isPro: boolean;

    @Column({ name: 'is_blocked', default: false })
    isBlocked: boolean;

    @Column({ name: 'avatar_key', nullable: true })
    avatarKey: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToOne(() => Profile, profile => profile.user, { cascade: true })
    profile: Profile;

    @OneToMany(() => Token, token => token.user)
    tokens: Token[];

    @OneToMany(() => Code, code => code.user)
    codes: Code[];

    @OneToMany(() => Album, album => album.user)
    albums: Album[];

    @OneToMany(() => Photo, photo => photo.user)
    photos: Photo[];

    @ManyToMany(() => Role, role => role.users)
    @JoinTable({
        name: 'users_roles',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'role_id',
            referencedColumnName: 'id'
        }
    })
    roles: Role[];

    @OneToMany(() => File, file => file.user)
    files: File[];

    @OneToMany(() => FilmingLocation, fl => fl.user)
    filmingLocations: FilmingLocation[];

    // вычисляемые поля
    distance?: number | null;
    isFavorite?: boolean;
    favoriteId?: number;
    favoritesCount?: number;
    isLiked?: boolean;
    likeId?: number;
    likesCount?: number;
    reviewsCount?: number;
    rating?: number;
}
