import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { ProCategory } from '@pro-categories/pro-categories.entity';
import { Specialization } from '@specializations/specializations.entity';

export default class ProCategorySeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const categoryRepo = dataSource.getRepository(ProCategory);
        const specializationRepo = dataSource.getRepository(Specialization);

        const categories = [
            'Фотографы',
            'Визажисты',
            'Модели',
            'Фотостудии',
            'Фотопечать',
            'Аренда/прокат вещей, оборудования, аксессуаров',
            'Видеографы',
            'Фотошколы',
            'Ретушеры',
            'Декораторы'
        ];

        const specializations = [
            'Животные',
            'Архитектура',
            'Репортаж',
            'Дети',
            'Семья',
            'Беременные',
            'Аэросъемки',
            'Видеосъемка',
            'Интерьеры',
            'Новорожденные',
            'Обучение фотографии',
            'Портрет',
            'Предметная съемка',
            'Каталожная съемка',
            'Реклама',
            'Свадебные',
            'Food',
            'Love Story',
            'Ню',
            '3d фотографы'
        ];

        await categoryRepo.upsert(
            categories.map(name => ({ name })),
            ['name']
        );

        await specializationRepo.upsert(
            specializations.map(name => ({ name })),
            ['name']
        );

        const allSpecializations = await specializationRepo.find();

        const photographers = await categoryRepo.findOne({
            where: { name: 'Фотографы' },
            relations: ['specializations']
        });

        const models = await categoryRepo.findOne({
            where: { name: 'Модели' },
            relations: ['specializations']
        });

        if (photographers) {
            photographers.specializations = allSpecializations;
            await categoryRepo.save(photographers);
        }

        if (models) {
            models.specializations = allSpecializations;
            await categoryRepo.save(models);
        }
    }
}
