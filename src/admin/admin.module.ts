import { Module } from '@nestjs/common';

import { SocialsModule } from '@socials/socials.module';
import { UsersModule } from '@users/users.module';

import { SocialsController } from './socials/socials.controller';
import { UsersController } from './users/users.controller';


@Module({
    imports: [UsersModule, SocialsModule],
    controllers: [UsersController, SocialsController]
})
export class AdminModule {}
