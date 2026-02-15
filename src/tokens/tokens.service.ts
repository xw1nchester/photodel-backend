import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './tokens.entity';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

@Injectable()
export class TokensService {
    constructor(
        @InjectRepository(Token)
        private tokensRepository: Repository<Token>
    ) {}

    async getRefreshToken(userId: number, userAgent: string) {
        const existingToken = await this.tokensRepository.findOne({
            where: { user: { id: userId }, userAgent },
            relations: ['user']
        });

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 14);

        if (existingToken) {
            existingToken.expiryDate = expiryDate;
            return this.tokensRepository.save(existingToken);
        }

        const newToken = this.tokensRepository.create({
            token: v4(),
            expiryDate,
            user: { id: userId },
            userAgent
        });

        return this.tokensRepository.save(newToken);
    }

    async deleteRefreshToken(token: string) {
        return await this.tokensRepository.delete({ token });
    }
}
