import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { FilesService } from '@files/files.service';
import { createUserDto } from '@shared/mappers/user.mapper';
import { TrainingsService } from '@trainings/trainings.service';
import { UsersService } from '@users/users.service';

import { TrainingRequestDto } from './dto/training-request.dto';
import {
    TrainingRequest,
    TrainingRequestStatus
} from './training-request.entity';

@Injectable()
export class TrainingRequestsService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(TrainingRequest)
        private readonly trainingRequestsRepository: Repository<TrainingRequest>,
        private readonly usersService: UsersService,
        private readonly trainingsService: TrainingsService,
        private readonly filesService: FilesService
    ) {}

    async findByIdAndReceiverId(id: number, receiverUserId: number) {
        const existingRequest = await this.trainingRequestsRepository.findOne({
            where: {
                id,
                receiverUserId
            }
        });

        if (!existingRequest) {
            throw new NotFoundException('Запрос не найден');
        }

        return existingRequest;
    }

    async sendRequest(senderUserId: number, dto: TrainingRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(TrainingRequest);

            if (senderUserId === dto.userId) {
                throw new BadRequestException(
                    'Нельзя отправить запрос самому себе'
                );
            }

            const isReceiverExists = await this.usersService.exists(dto.userId);

            if (!isReceiverExists) {
                throw new NotFoundException('Пользователь не найден');
            }

            const isTrainingExists =
                await this.trainingsService.findByIdAndUserId(
                    dto.trainingId,
                    dto.userId,
                    manager
                );

            if (!isTrainingExists) {
                throw new NotFoundException('Обучение не найдено');
            }

            const existingRequest = await repo.findOne({
                where: {
                    senderUserId,
                    receiverUserId: dto.userId,
                    trainingId: dto.trainingId
                    // status: TrainingRequestStatus.PENDING
                }
            });

            // if (existingRequest?.status == TrainingRequestStatus.REJECTED) {
            //     existingRequest.status = TrainingRequestStatus.PENDING;
            //     return await repo.save(existingRequest);
            // }

            if (existingRequest) {
                throw new BadRequestException(
                    'Запрос на обучение уже отправлен'
                );
            }

            return await repo.save({
                senderUserId,
                receiverUserId: dto.userId,
                trainingId: dto.trainingId,
                status: TrainingRequestStatus.PENDING
            });
        });
    }

    async acceptRequest(id: number, userId: number) {
        const existingRequest = await this.findByIdAndReceiverId(id, userId);

        existingRequest.status = TrainingRequestStatus.ACCEPTED;
        return await this.trainingRequestsRepository.save(existingRequest);
    }

    async rejectRequest(id: number, userId: number) {
        const existingRequest = await this.findByIdAndReceiverId(id, userId);

        existingRequest.status = TrainingRequestStatus.REJECTED;

        return await this.trainingRequestsRepository.save(existingRequest);
    }

    async removeRequest(id: number, userId: number) {
        const existingRequest = await this.findByIdAndReceiverId(id, userId);
        return await this.trainingRequestsRepository.remove(existingRequest);
    }

    createDto(trainingRequest: TrainingRequest) {
        const avatarUrl = trainingRequest.senderUser.avatarKey
            ? this.filesService.getUrl(trainingRequest.senderUser.avatarKey)
            : null;

        const user = createUserDto(trainingRequest.senderUser, avatarUrl);

        const training = this.trainingsService.createBasicDto(
            trainingRequest.training
        );

        return {
            id: trainingRequest.id,
            user,
            status: trainingRequest.status,
            training,
            createdAt: trainingRequest.createdAt,
            updatedAt: trainingRequest.updatedAt
        };
    }

    async findRequests(userId: number) {
        const query = this.trainingRequestsRepository
            .createQueryBuilder('tr')
            .where('tr.receiverUserId = :userId', { userId })
            .leftJoinAndSelect('tr.senderUser', 'senderUser')
            .leftJoinAndSelect('senderUser.profile', 'senderProfile')
            .leftJoinAndSelect('senderProfile.location', 'senderLocation')
            .leftJoinAndSelect('senderLocation.place', 'senderPlace')
            .leftJoinAndSelect('tr.training', 'training')
            .leftJoinAndSelect('training.location', 'trainingLocation')
            .leftJoinAndSelect(
                'trainingLocation.place',
                'trainingLocationPlace'
            )
            .leftJoinAndSelect('training.previewFile', 'trainingPreview')
            .leftJoinAndSelect('training.user', 'trainingUser')
            .orderBy(
                `CASE tr.status
                    WHEN 'pending' THEN 1
                    WHEN 'accepted' THEN 2
                    WHEN 'completed' THEN 3
                    WHEN 'rejected' THEN 4
                END`,
                'ASC'
            )
            .addOrderBy('tr.updatedAt', 'DESC');

        const data = await query.getMany();

        const trainingRequests = data.map(tr => this.createDto(tr));

        return { trainingRequests };
    }
}
