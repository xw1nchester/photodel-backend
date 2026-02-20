import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn
} from 'typeorm';

import { ProCategory } from '@pro-categories/pro-categories.entity';
import { Profile } from '@users/entities/profiles.entity';

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
}
