import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, EntityManager } from 'typeorm';

import { Social } from './socials.entity';

@Injectable()
export class SocialsService {
    constructor(
        @InjectRepository(Social)
        private socialsRepository: Repository<Social>
    ) {}

    async findAll() {
        const socials = await this.socialsRepository.find();
        return { socials };
    }

    async validateByIds(ids: number[], manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(Social)
            : this.socialsRepository;

        ids = [...new Set(ids)];

        const socials = await repo.find({
            where: { id: In(ids) }
        });

        if (ids.length != socials.length) {
            throw new NotFoundException('Социальная сеть не найдена');
        }
    }
}
