import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { Social } from '@socials/socials.entity';

export default class SocialSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const repo = dataSource.getRepository(Social);

        await repo.upsert(
            [
                { name: 'phone' },
                { name: 'site' },
                { name: 'email' },
                { name: 'facebook' },
                { name: 'instagram' },
                { name: 'vk' }
            ],
            ['name']
        );
    }
}
