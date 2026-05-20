import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Photo } from './photo.entity';

@Entity('daily_best_photos')
export class DailyBestPhoto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'start_date', type: 'date' })
    date: Date;

    @Column({ name: 'photo_id' })
    photoId: number;

    @ManyToOne(() => Photo, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'photo_id' })
    photo: Photo;
}
