import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    Point,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Place } from './place.entity';

@Entity('locations')
export class Location {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'geography',
        srid: 4326,
        spatialFeatureType: 'Point'
    })
    coordinates: Point;

    @Column({ nullable: true })
    address: string;

    @Column({ name: 'place_id', nullable: true })
    placeId: Place;

    @ManyToOne(() => Place, place => place.locations, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'place_id' })
    place: Place;
}
