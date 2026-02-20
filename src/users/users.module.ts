import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProCategory } from '@pro-categories/pro-categories.entity';
import { Social } from '@socials/socials.entity';
import { Specialization } from '@specializations/specializations.entity';

import { ProfileSocial } from './entities/profiles-socials.entity';
import { Profile } from './entities/profiles.entity';
import { User } from './entities/users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Profile,
            ProfileSocial,
            ProCategory,
            Specialization,
            Social
        ])
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule {}
