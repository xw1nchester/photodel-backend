import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { Role } from '@roles/roles.entity';

export default class RoleSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const repo = dataSource.getRepository(Role);

        await repo.upsert([{ name: 'ADMIN' }, { name: 'MODERATOR' }], ['name']);
    }
}
