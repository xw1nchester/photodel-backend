import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, EntityManager } from 'typeorm';

import { Specialization } from './specializations.entity';

@Injectable()
export class SpecializationsService {
    constructor(
        @InjectRepository(Specialization)
        private specializarionaRepository: Repository<Specialization>
    ) {}

    async findAll(categoryIds?: number[]) {
        if (categoryIds && categoryIds.length > 0) {
            const specializations = await this.specializarionaRepository
                .createQueryBuilder('specialization')
                .innerJoin('specialization.proCategories', 'proCategory')
                .where('proCategory.id IN (:...categoryIds)', { categoryIds })
                .distinct(true)
                .getMany();
            return { specializations };
        }
        const specializations = await this.specializarionaRepository.find();
        return { specializations };
    }

    async findAndValidateByIds(ids: number[], manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(Specialization)
            : this.specializarionaRepository;
            
        ids = [...new Set(ids)];

        const specializations = await repo.find({
            where: { id: In(ids) }
        });

        if (ids.length != specializations.length) {
            throw new NotFoundException('Специализация не найдена');
        }

        return specializations;
    }
}
