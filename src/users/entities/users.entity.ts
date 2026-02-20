import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
    OneToOne
} from 'typeorm';

import { Code } from '@codes/codes.entity';
import { Token } from '@tokens/tokens.entity';

import { Profile } from './profiles.entity';

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

    // TODO: удалить т.к. есть в профиле
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

    @OneToOne(() => Profile, profile => profile.user, { cascade: true })
    profile: Profile;

    @OneToMany(() => Token, token => token.user)
    tokens: Token[];

    @OneToMany(() => Code, code => code.user)
    codes: Code[];
}
