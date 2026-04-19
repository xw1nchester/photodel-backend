import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LocationsModule } from '@locations/locations.module';
import { UsersModule } from '@users/users.module';

import { FilmingRequestsController } from './filming-requests.controller';
import { FilmingRequest } from './filming-requests.entity';
import { FilmingRequestsService } from './filming-requests.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([FilmingRequest]),
        UsersModule,
        LocationsModule
    ],
    controllers: [FilmingRequestsController],
    providers: [FilmingRequestsService]
})
export class FilmingRequestsModule {}
