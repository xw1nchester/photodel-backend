import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Social } from '@socials/socials.entity';

import { Profile } from './profiles.entity';

@Entity('profiles_socials')
export class ProfileSocial {
    @PrimaryColumn({ name: 'profile_id' })
    profileId: number;

    @PrimaryColumn({ name: 'social_id' })
    socialId: number;

    @ManyToOne(() => Profile, profile => profile.socials, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'profile_id' })
    profile: Profile;

    @ManyToOne(() => Social, social => social.profiles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'social_id' })
    social: Social;

    @Column()
    value: string;
}
