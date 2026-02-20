import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CodesModule } from './codes/codes.module';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './mail/mail.module';
import { ProCategoriesModule } from './pro-categories/pro-categories.module';
import { SocialsModule } from './socials/socials.module';
import { SpecializationsModule } from './specializations/specializations.module';
import { TokensModule } from './tokens/tokens.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        DatabaseModule,
        UsersModule,
        SpecializationsModule,
        CodesModule,
        AuthModule,
        // TODO: нужны ли они тут если импортируются в auth?
        TokensModule,
        MailModule,
        ProCategoriesModule,
        SocialsModule
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        }
    ]
})
export class AppModule {}
