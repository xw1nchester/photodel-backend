import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { RegisterRequestDto } from '@auth/dto/register-request.dto';

import { UserDto } from './dto/user.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {}

    async findById(id: number) {
        const user = await this.usersRepository.findOneBy({ id });

        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        return user;
    }

    async findByEmail(email: string, manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(User)
            : this.usersRepository;

        return await repo.findOneBy({ email });
    }

    createDto(user: User) {
        return new UserDto(user);
    }

    // TODO: хорошая ли идея использовать dto из другого модуля?
    async create(dto: RegisterRequestDto, manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(User)
            : this.usersRepository;

        const user = repo.create({
            ...dto,
            passwordHash: dto.password
        });

        return await repo.save(user);
    }

    async getDtoById(id: number) {
        const user = await this.findById(id);
        return { user: this.createDto(user) };
    }

    async verifyById(id: number, manager?: EntityManager) {
        const repo = manager
            ? manager.getRepository(User)
            : this.usersRepository;

        return await repo.update({ id }, { isVerified: true });
    }
}
