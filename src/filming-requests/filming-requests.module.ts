import { Module } from '@nestjs/common';
import { FilmingRequestsService } from './filming-requests.service';
import { FilmingRequestsController } from './filming-requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilmingRequest } from './filming-requests.entity';
import { UsersModule } from '@users/users.module';
import { LocationsModule } from '@locations/locations.module';

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
