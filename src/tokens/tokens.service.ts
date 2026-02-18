import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { Token } from './tokens.entity';

@Injectable()
export class TokensService {
    constructor(
        @InjectRepository(Token)
        private tokensRepository: Repository<Token>
    ) {}

    async updateOrCreateToken(
        userId: number,
        userAgent: string,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(Token)
            : this.tokensRepository;

        const existingToken = await repo.findOne({
            where: { user: { id: userId }, userAgent },
            relations: {
                user: true
            }
        });

        const token = v4();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 14);

        if (existingToken) {
            await repo.update(
                { token: existingToken.token },
                {
                    token,
                    expiryDate
                }
            );
            return await repo.findOneBy({ token });
        }

        return await repo.save({
            token,
            expiryDate,
            user: { id: userId },
            userAgent
        });
    }

    async findToken(token: string) {
        return await this.tokensRepository.findOne({
            where: { token },
            relations: {
                user: true
            }
        });
    }

    async deleteToken(token: string) {
        return await this.tokensRepository.delete({ token });
    }
}
