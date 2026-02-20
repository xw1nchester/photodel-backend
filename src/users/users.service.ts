import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { RegisterRequestDto } from '@auth/dto/register-request.dto';
import { ProCategory } from '@pro-categories/pro-categories.entity';
import { Social } from '@socials/socials.entity';
import { Specialization } from '@specializations/specializations.entity';

import { ProfileRequestDto } from './dto/profile-request.dto';
import { UserDto } from './dto/user.dto';
import { Profile } from './entities/profiles.entity';
import { ProfileSocial } from './entities/profiles-socials.entity';
import { User } from './entities/users.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Profile)
        private profileRepository: Repository<Profile>,
        @InjectRepository(ProfileSocial)
        private profileSocialRepository: Repository<ProfileSocial>,
        @InjectRepository(ProCategory)
        private proCategoryRepository: Repository<ProCategory>,
        @InjectRepository(Specialization)
        private specializationRepository: Repository<Specialization>,
        @InjectRepository(Social)
        private socialRepository: Repository<Social>
    ) {}

    async findById(id: number) {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: { profile: true }
        });

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
            passwordHash: dto.password,
            profile: {}
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

    // TODO: рефакторить
    async update(userId: number, dto: ProfileRequestDto) {
        const user = await this.findById(userId);

        const profile = user.profile;

        if (dto.price !== undefined) profile.price = dto.price;
        if (dto.conditions !== undefined) profile.conditions = dto.conditions;
        if (dto.equipment !== undefined) profile.equipment = dto.equipment;
        if (dto.geography !== undefined) profile.geography = dto.geography;
        if (dto.languages !== undefined) profile.languages = dto.languages;
        if (dto.about !== undefined) profile.about = dto.about;

        if (dto.proCategoryIds) {
            profile.proCategories = await this.proCategoryRepository.findByIds(
                dto.proCategoryIds
            );
        }

        // Update specializations
        if (dto.specializationIds) {
            profile.specializations =
                await this.specializationRepository.findByIds(
                    dto.specializationIds
                );
        }

        // Save profile first
        await this.profileRepository.save(profile);

        // Update socials
        if (dto.socials) {
            // Remove existing socials
            await this.profileSocialRepository.delete({
                profileId: profile.id
            });

            // Add new socials
            const socials = dto.socials.map(socialDto => {
                const profileSocial = this.profileSocialRepository.create({
                    profileId: profile.id,
                    socialId: socialDto.id,
                    value: socialDto.value
                });
                return profileSocial;
            });

            await this.profileSocialRepository.save(socials);
        }

        // Reload profile with relations
        return await this.profileRepository.findOne({
            where: { id: profile.id },
            relations: [
                'proCategories',
                'specializations',
                'socials',
                'socials.social'
            ]
        });
    }
}
