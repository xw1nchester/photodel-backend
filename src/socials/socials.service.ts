import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, EntityManager, Not, DataSource } from 'typeorm';

import { Social } from './entities/social.entity';
import { SocialRequestDto } from '@admin/socials/dto/social-request.dto';
import { SiteSocial } from './entities/site-social.entity';
import { SiteSocialsRequestDto } from '@admin/socials/dto/site-socials.request.dto';

@Injectable()
export class SocialsService {
    constructor(
        @InjectRepository(Social)
        private socialsRepository: Repository<Social>,
        @InjectRepository(SiteSocial)
        private siteSocialsRepository: Repository<SiteSocial>,
        private readonly dataSource: DataSource
    ) {}

    async findAll() {
        const socials = await this.socialsRepository.find();
        return { socials };
    }

    async findById(id: number) {
        const social = await this.socialsRepository.findOne({ where: { id } });
        if (!social) {
            throw new NotFoundException('Социальная сеть не найдена');
        }
        return social;
    }

    async create(dto: SocialRequestDto) {
        const existingSocial = await this.socialsRepository.findOne({
            where: { name: dto.name }
        });

        if (existingSocial) {
            throw new BadRequestException(
                'Социальная сеть с таким названием уже существует'
            );
        }

        const social = await this.socialsRepository.save({ ...dto });

        return { social };
    }

    async update(id: number, dto: SocialRequestDto) {
        await this.findById(id);

        const existingSocial = await this.socialsRepository.findOne({
            where: { name: dto.name, id: Not(id) }
        });

        if (existingSocial) {
            throw new BadRequestException(
                'Социальная сеть с таким названием уже существует'
            );
        }

        await this.socialsRepository.update(id, dto);
        return { social: await this.findById(id) };
    }

    async delete(id: number) {
        const social = await this.findById(id);
        await this.socialsRepository.remove(social);
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

    async findSiteSocials() {
        const socials = await this.siteSocialsRepository.find({
            relations: { social: true }
        });

        const dto = socials.map(item => ({
            id: item.social.id,
            name: item.social.name,
            profileIcon: item.social.profileIcon,
            siteIcon: item.social.siteIcon,
            label: item.label,
            url: item.url,
        }))

        return { socials: dto };
    }

    async updateSiteSocials(dto: SiteSocialsRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(SiteSocial);

            await this.validateByIds(
                dto.socials.map(item => item.socialId),
                manager
            );

            await repo.deleteAll();

            await repo.save(dto.socials.map(item => ({ ...item })));
        });
    }
}
