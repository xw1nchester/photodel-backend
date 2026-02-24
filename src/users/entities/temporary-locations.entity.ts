import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Point } from 'typeorm';

import { Profile } from './profiles.entity';

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

    @Column({
        type: 'geography',
        srid: 4326,
        spatialFeatureType: 'Point'
    })
    coordinates: Point;

    // TODO: текстовое название?

    @Column({ nullable: true })
    comment: string;

    @ManyToOne(() => Profile, profile => profile.temporaryLocations, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'profile_id' })
    profile: Profile;
}
