import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn
} from 'typeorm';

import { FilmingLocation } from '@filming-locations/filming-location.entity';
import { Photo } from '@photos/entities/photo.entity';
import { ProCategory } from '@pro-categories/pro-category.entity';
import { Profile } from '@users/entities/profile.entity';

@Entity('specializations')
export class Specialization {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => ProCategory, proCategory => proCategory.specializations)
    proCategories: ProCategory[];

    @ManyToMany(() => Profile, profile => profile.specializations)
    @JoinTable({
        name: 'specializations_profiles',
        joinColumn: {
            name: 'specialization_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'profile_id',
            referencedColumnName: 'id'
        }
    })
    profiles: Profile[];

    @ManyToMany(() => Photo, photo => photo.specializations)
    photos: Photo[];

    @ManyToMany(() => FilmingLocation, fl => fl.specializations)
    filmingLocations: FilmingLocation[];
}
