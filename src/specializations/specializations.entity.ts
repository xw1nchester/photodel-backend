import { User } from '@users/users.entity';
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent } from 'typeorm';

@Entity('specializations')
@Tree("closure-table")
export class Specialization {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @TreeChildren()
    children: Specialization[];

    @TreeParent()
    @JoinColumn({ name: 'parent_id' })
    parent: Specialization;

    @OneToMany(() => User, user => user.specialization)
    users: User[];
}
