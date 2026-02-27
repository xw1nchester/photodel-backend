import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ProfileSocial } from '@users/entities/profile-social.entity';

@Entity('socials')
export class Social {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    icon: string;

    @OneToMany(() => ProfileSocial, profileSocial => profileSocial.social)
    profiles: ProfileSocial[];
}
