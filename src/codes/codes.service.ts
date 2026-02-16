import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, MoreThan, Repository } from 'typeorm';

import { Code } from './codes.entity';
import { CodeType } from './enums';

@Injectable()
export class CodesService {
    constructor(
        @InjectRepository(Code)
        private codesRepository: Repository<Code>
    ) {}

    private async deleteUserCodes(
        repo: Repository<Code>,
        type: CodeType,
        userId: number
    ) {
        return await repo.delete({ user: { id: userId }, type });
    }

    private async create(
        repo: Repository<Code>,
        type: CodeType,
        userId: number,
        retryIntervalMinutes: number,
        expiryMinutes: number
    ) {
        await this.deleteUserCodes(repo, type, userId);

        const randomCode = Math.floor(Math.random() * 1000000);
        const formattedCode = randomCode.toString().padStart(6, '0');

        const addMinutesToDate = (date: Date, minutes: number) => {
            const newDate = new Date(date);
            newDate.setMinutes(newDate.getMinutes() + minutes);
            return newDate;
        };

        const retryDate = addMinutesToDate(new Date(), retryIntervalMinutes);
        const expiryDate = addMinutesToDate(new Date(), expiryMinutes);

        await repo.save({
            type,
            code: formattedCode,
            retryDate,
            expiryDate,
            user: { id: userId }
        });

        return formattedCode;
    }

    async createVerificationCode(userId: number, manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(Code)
            : this.codesRepository;

        const existingCode = await repo.findOneBy({
            type: CodeType.VERIFICATION,
            user: { id: userId },
            retryDate: MoreThan(new Date())
        });

        if (existingCode) {
            // TODO: подумать над обработкой выше
            throw new BadRequestException('Код уже отправлен');
        }

        return await this.create(repo, CodeType.VERIFICATION, userId, 1, 5);
    }

    async validateVerificationCode(
        code: string,
        userId: number,
        manager?: EntityManager,
    ) {
        const repo = manager
            ? manager.getRepository(Code)
            : this.codesRepository;

        const existingCode = await repo.findOneBy({
            type: CodeType.VERIFICATION,
            code,
            user: { id: userId },
            expiryDate: MoreThan(new Date())
        });

        if (!existingCode) {
            // TODO: подумать над обработкой выше
            throw new BadRequestException('Код недействителен или истек');
        }

        await this.deleteUserCodes(repo, CodeType.VERIFICATION, userId);
    }
}
