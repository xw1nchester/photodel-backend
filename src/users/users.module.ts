import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProCategoriesModule } from '@pro-categories/pro-categories.module';
import { SocialsModule } from '@socials/socials.module';
import { SpecializationsModule } from '@specializations/specializations.module';

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
            ProfileSocial
        ]),
        ProCategoriesModule,
        SpecializationsModule,
        SocialsModule
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule {}
