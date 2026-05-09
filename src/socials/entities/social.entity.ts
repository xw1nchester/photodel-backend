import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('socials')
export class Social {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ name: 'profile_icon', nullable: true })
    profileIcon: string;

    @Column({ name: 'site_icon', nullable: true })
    siteIcon: string;
}
