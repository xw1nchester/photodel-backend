import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from '@auth/auth.module';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { DatabaseModule } from '@database/database.module';

import { AppController } from './app.controller';
import { FilesModule } from './files/files.module';
import { LocationModule } from './location/location.module';
import { RolesModule } from './roles/roles.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        DatabaseModule,
        AuthModule,
        RolesModule,
        FilesModule,
        LocationModule
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
