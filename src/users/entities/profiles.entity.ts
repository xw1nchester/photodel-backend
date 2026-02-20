import {
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn
} from 'typeorm';

import { ProCategory } from '@pro-categories/pro-categories.entity';
import { Specialization } from '@specializations/specializations.entity';

import { ProfileSocial } from './profiles-socials.entity';
import { User } from './users.entity';

@Entity('profiles')
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

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

    // TODO: location (postgis)
    // TODO: tmp location

    @OneToOne(() => User, user => user.profile)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToMany(() => ProCategory, proCategory => proCategory.profiles)
    proCategories: ProCategory[];

    @ManyToMany(() => Specialization, specialization => specialization.profiles)
    specializations: Specialization[];

    @OneToMany(() => ProfileSocial, profileSocial => profileSocial.profile)
    socials: ProfileSocial[];
}
