import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { SpecializationsModule } from './specializations/specializations.module';
import { CodesModule } from './codes/codes.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { TokensModule } from './tokens/tokens.module';

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
        TokensModule
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
