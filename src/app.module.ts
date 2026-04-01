import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from '@auth/auth.module';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { DatabaseModule } from '@database/database.module';

import { AppController } from './app.controller';
import { FavoritesModule } from './favorites/favorites.module';
import { FilesModule } from './files/files.module';
import { LikesModule } from './likes/likes.module';
import { ReviewsModule } from './reviews/reviews.module';
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
        FavoritesModule,
        LikesModule,
        ReviewsModule
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
