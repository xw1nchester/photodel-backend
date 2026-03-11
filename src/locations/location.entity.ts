import { Column, Entity, PrimaryGeneratedColumn, Point } from 'typeorm';

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
}
