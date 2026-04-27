import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TrainingsModule } from '@trainings/trainings.module';
import { UsersModule } from '@users/users.module';

import { TrainingRequest } from './training-request.entity';
import { TrainingRequestsController } from './training-requests.controller';
import { TrainingRequestsService } from './training-requests.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([TrainingRequest]),
        UsersModule,
        TrainingsModule
    ],
    controllers: [TrainingRequestsController],
    providers: [TrainingRequestsService]
})
export class TrainingRequestsModule {}
