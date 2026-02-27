import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';

import { Location } from '@location/location.entity';

import { Profile } from './profile.entity';

@Entity('temporary_locations')
export class TemporaryLocation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'profile_id' })
    profileId: number;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date' })
    endDate: Date;

    @ManyToOne(() => Location, { cascade: true })
    @JoinColumn({ name: 'location_id' })
    location: Location;

    @Column({ nullable: true })
    comment: string;

    @ManyToOne(() => Profile, profile => profile.temporaryLocations, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'profile_id' })
    profile: Profile;
}
