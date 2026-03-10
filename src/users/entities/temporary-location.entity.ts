import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';

import { Location } from '@locations/location.entity';

import { Profile } from './profile.entity';

@Entity('temporary_locations')
export class TemporaryLocation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'profile_id' })
    profileId: number;

    @Column({ name: 'start_date', type: 'date' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date' })
    endDate: Date;

    @ManyToOne(() => Location, { cascade: true, onDelete: 'CASCADE' })
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
