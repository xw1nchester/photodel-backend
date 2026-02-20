import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Specialization } from './specializations.entity';
import { Repository } from 'typeorm';

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
}
