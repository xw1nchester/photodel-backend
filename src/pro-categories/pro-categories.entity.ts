import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable
} from 'typeorm';

import { Specialization } from '@specializations/specializations.entity';
import { Profile } from '@users/entities/profiles.entity';

@Entity('pro_categories')
export class ProCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => Profile, profile => profile.proCategories)
    @JoinTable({
        name: 'pro_categories_profiles',
        joinColumn: {
            name: 'pro_category_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'profile_id',
            referencedColumnName: 'id'
        }
    })
    profiles: Profile[];

    @ManyToMany(
        () => Specialization,
        specialization => specialization.proCategories
    )
    @JoinTable({
        name: 'pro_categories_specializations',
        joinColumn: {
            name: 'pro_category_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'specialization_id',
            referencedColumnName: 'id'
        }
    })
    specializations: Specialization[];
}
