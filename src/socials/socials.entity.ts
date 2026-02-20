import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ProfileSocial } from '@users/entities/profiles-socials.entity';

@Entity('socials')
export class Social {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @OneToMany(() => ProfileSocial, profileSocial => profileSocial.social)
    profiles: ProfileSocial[];
}
