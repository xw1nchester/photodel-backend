import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Social } from '@socials/entities/social.entity';

@Entity('site_socials')
export class SiteSocial {
    @PrimaryColumn({ name: 'social_id' })
    socialId: number;

    @ManyToOne(() => Social, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'social_id' })
    social: Social;

    @Column()
    label: string;

    @Column()
    url: string;
}
