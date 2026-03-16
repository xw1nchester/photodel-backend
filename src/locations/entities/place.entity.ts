import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    Point,
    OneToMany,
    Unique
} from 'typeorm';

import { Location } from './location.entity';

@Entity('places')
@Unique(['country', 'city'])
export class Place {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'geography',
        srid: 4326,
        spatialFeatureType: 'Point'
    })
    coordinates: Point;

    @Column()
    country: string;

    @Column()
    city: string;

    @OneToMany(() => Location, location => location.place)
    locations: Location[];
}
