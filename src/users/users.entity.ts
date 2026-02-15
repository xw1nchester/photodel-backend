import { Token } from '@tokens/tokens.entity';
import { Specialization } from '@specializations/specializations.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column({ name: 'first_name' })
    firstName: string;

    @Column({ name: 'last_name' })
    lastName: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ name: 'password_hash' })
    passwordHash: string;

    @Column({ name: 'is_adult' })
    isAdult: boolean;

    @Column({ name: 'is_professional' })
    isProfessional: boolean;

    @Column({ name: 'is_verified', default: false })
    isVerified: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // @UpdateDateColumn({ name: 'updated_at' })
    // updatedAt: Date;

    @ManyToOne(() => Specialization, specialization => specialization.users, {
        nullable: true,
    })
    @JoinColumn({ name: 'specialization_id' })
    specialization: Specialization;

    @OneToMany(() => Token, token => token.user)
    tokens: Token[]
}
