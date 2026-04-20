import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

import { File } from '@files/file.entity';
import { EntityType } from '@shared/enums/entity-type.enums';
import { User } from '@users/entities/user.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column({ nullable: true })
    rating: number;

    @ManyToMany(() => File)
    @JoinTable({
        name: 'reviews_files',
        joinColumn: {
            name: 'review_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'file_id',
            referencedColumnName: 'id'
        }
    })
    files: File[];

    @Column({ name: 'is_published', default: false })
    isPublished: boolean;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({
        name: 'entity_type',
        type: 'enum',
        enum: EntityType
    })
    entityType: EntityType;

    @Column({ name: 'entity_id' })
    entityId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // вычисляемые поля
    // TODO: разобраться с типом, должен быть User | Photo
    entity: any;
}
