import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, EntityManager } from 'typeorm';

import { ProCategory } from './pro-categories.entity';

@Injectable()
export class ProCategoriesService {
    constructor(
        @InjectRepository(ProCategory)
        private proCategoriesRepository: Repository<ProCategory>
    ) {}

    async findAll() {
        const proCategories = await this.proCategoriesRepository.find();
        return { proCategories };
    }

    async findAndValidateByIds(ids: number[], manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(ProCategory)
            : this.proCategoriesRepository;
            
        ids = [...new Set(ids)];

        const proCategories = await repo.find({
            where: { id: In(ids) }
        });

        if (ids.length != proCategories.length) {
            throw new NotFoundException('Категория не найдена');
        }

        return proCategories;
    }
}
