import {
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn
} from 'typeorm';

import { Location } from '@locations/entities/location.entity';
import { ProCategory } from '@pro-categories/pro-category.entity';
import { Specialization } from '@specializations/specialization.entity';

import { ProfileSocial } from './profile-social.entity';
import { TemporaryLocation } from './temporary-location.entity';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    status: string;

    @Column({ nullable: true })
    price: string;

    @Column({ nullable: true })
    conditions: string;

    @Column({ nullable: true })
    equipment: string;

    @Column('text', { array: true, nullable: true })
    geography: string[];

    @Column('text', { array: true, nullable: true })
    languages: string[];

    @Column({ nullable: true })
    about: string;

    @ManyToOne(() => Location, { cascade: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'location_id' })
    location: Location;

    @OneToOne(() => User, user => user.profile)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToMany(() => ProCategory, proCategory => proCategory.profiles)
    proCategories: ProCategory[];

    @ManyToMany(() => Specialization, specialization => specialization.profiles)
    specializations: Specialization[];

    @OneToMany(() => ProfileSocial, profileSocial => profileSocial.profile, {
        cascade: true
    })
    socials: ProfileSocial[];

    @OneToMany(
        () => TemporaryLocation,
        temporaryLocation => temporaryLocation.profile,
        {
            cascade: true,
            orphanedRowAction: 'delete'
        }
    )
    temporaryLocations: TemporaryLocation[];

    // isFavorite: boolean;
}
