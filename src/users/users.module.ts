import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TeamsModule } from '@teams/teams.module';
import { AlbumsModule } from '@albums/albums.module';
import { LocationsModule } from '@locations/locations.module';
import { ProCategoriesModule } from '@pro-categories/pro-categories.module';
import { S3Module } from '@s3/s3.module';
import { SocialsModule } from '@socials/socials.module';
import { SpecializationsModule } from '@specializations/specializations.module';

import { ProfileSocial } from './entities/profile-social.entity';
import { Profile } from './entities/profile.entity';
import { TemporaryLocation } from './entities/temporary-location.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Profile,
            ProfileSocial,
            TemporaryLocation
        ]),
        forwardRef(() => TeamsModule),
        ProCategoriesModule,
        S3Module,
        SpecializationsModule,
        SocialsModule,
        LocationsModule,
        AlbumsModule
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule {}
