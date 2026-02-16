import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './tokens.entity';
import { EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';

@Injectable()
export class TokensService {
    constructor(
        @InjectRepository(Token)
        private tokensRepository: Repository<Token>
    ) {}

    async getRefreshToken(
        userId: number,
        userAgent: string,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(Token)
            : this.tokensRepository;

        const existingToken = await repo.findOne({
            where: { user: { id: userId }, userAgent },
            relations: ['user']
        });

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 14);

        if (existingToken) {
            existingToken.expiryDate = expiryDate;
            return repo.save(existingToken);
        }

        const newToken = repo.create({
            token: v4(),
            expiryDate,
            user: { id: userId },
            userAgent
        });

        return repo.save(newToken);
    }

    async deleteRefreshToken(token: string) {
        return await this.tokensRepository.delete({ token });
    }
}
