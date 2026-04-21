import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from '@auth/auth.module';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { DatabaseModule } from '@database/database.module';

import { AppController } from './app.controller';
import { FavoritesModule } from './favorites/favorites.module';
import { FilesModule } from './files/files.module';
import { FilmingRequestsModule } from './filming-requests/filming-requests.module';
import { LikesModule } from './likes/likes.module';
import { ChatsModule } from './messenger/chats/chats.module';
import { MessagesModule } from './messenger/messages/messages.module';
import { PhotoSessionsModule } from './photo-sessions/photo-sessions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { RolesModule } from './roles/roles.module';
import { TeamsModule } from './teams/teams.module';
import { TrainingsModule } from './trainings/trainings.module';

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
        ReviewsModule,
        PhotoSessionsModule,
        TeamsModule,
        FilmingRequestsModule,
        ChatsModule,
        MessagesModule,
        TrainingsModule
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
