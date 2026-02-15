import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { RegisterRequestDto } from '@auth/dto/register-request.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {}

    async findByEmail(email: string) {
        return await this.usersRepository.findOneBy({ email });
    }

    createDto(user: User) {
        return new UserDto(user);
    }

    // TODO: хорошая ли идея использовать dto из другого модуля?
    async createUser(dto: RegisterRequestDto) {
        const user = this.usersRepository.create({
            ...dto,
            passwordHash: dto.password
        });

        return await this.usersRepository.save(user);
    }
}
