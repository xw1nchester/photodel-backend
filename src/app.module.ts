import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from '@auth/auth.module';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { DatabaseModule } from '@database/database.module';

import { AlbumsModule } from './albums/albums.module';
import { AppController } from './app.controller';
import { FilesModule } from './files/files.module';
import { LocationsModule } from './locations/locations.module';
import { PhotosModule } from './photos/photos.module';
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
        LocationsModule,
        AlbumsModule,
        PhotosModule
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
