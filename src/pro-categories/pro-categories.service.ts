import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProCategory } from './pro-categories.entity';
import { Repository } from 'typeorm';

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
}
