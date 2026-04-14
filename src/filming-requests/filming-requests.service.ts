import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    FilmingRequest,
    FilmingRequestStatus
} from './filming-requests.entity';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from '@users/users.service';
import { FilmingRequestDto } from './dto/filming-request.dto';
import { LocationsService } from '@locations/locations.service';
import { FilesService } from '@files/files.service';
import { createUserDto } from '@shared/mappers/user.mapper';

@Injectable()
export class FilmingRequestsService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(FilmingRequest)
        private readonly filmingRequestsRepository: Repository<FilmingRequest>,
        private readonly usersService: UsersService,
        private readonly locationsService: LocationsService,
        private readonly filesService: FilesService
    ) {}

    async findByIdAndReceiverId(id: number, receiverUserId: number) {
        const existingRequest = await this.filmingRequestsRepository.findOne({
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

    async sendRequest(senderUserId: number, dto: FilmingRequestDto) {
        return await this.dataSource.transaction(async manager => {
            const repo = manager.getRepository(FilmingRequest);

            if (new Date(dto.date) < new Date()) {
                throw new BadRequestException('Некорретная дата съемки');
            }

            if (senderUserId == dto.userId) {
                throw new BadRequestException(
                    'Нельзя отправить запрос самому себе'
                );
            }

            const isRecieverExists = await this.usersService.exists(dto.userId);

            if (!isRecieverExists) {
                throw new NotFoundException('Пользователь не найден');
            }

            // TODO: не более n запросов одному пользователю (в статусе pending)

            const location = await this.locationsService.create(
                dto.location,
                manager
            );

            return await repo.save({
                senderUserId,
                receiverUserId: dto.userId,
                date: dto.date,
                durationHours: dto.durationHours,
                location,
                type: dto.type,
                peoplesCount: dto.peoplesCount,
                budget: dto.budget,
                needsMakeupArtist: dto.needsMakeupArtist,
                comment: dto.comment
            });
        });
    }

    async acceptRequest(id: number, userId: number) {
        const existingRequest = await this.findByIdAndReceiverId(id, userId);

        existingRequest.status = FilmingRequestStatus.ACCEPTED;
        return await this.filmingRequestsRepository.save(existingRequest);
    }

    async rejectRequest(id: number, userId: number) {
        const existingRequest = await this.findByIdAndReceiverId(id, userId);

        existingRequest.status = FilmingRequestStatus.REJECTED;

        return await this.filmingRequestsRepository.save(existingRequest);
    }

    async removeRequest(id: number, userId: number) {
        const existingRequest = await this.findByIdAndReceiverId(id, userId);
        return await this.filmingRequestsRepository.remove(existingRequest);
    }

    createDto(filmingRequest: FilmingRequest) {
        const avatarUrl = filmingRequest.senderUser.avatarKey
            ? this.filesService.getUrl(filmingRequest.senderUser.avatarKey)
            : null;

        const user = createUserDto(filmingRequest.senderUser, avatarUrl);

        const location = this.locationsService.createDto(
            filmingRequest.location
        );

        return {
            id: filmingRequest.id,
            user,
            status: filmingRequest.status,
            date: filmingRequest.date,
            durationHours: filmingRequest.durationHours,
            location,
            type: filmingRequest.type,
            peoplesCount: filmingRequest.peoplesCount,
            budget: filmingRequest.budget,
            needsMakeupArtist: filmingRequest.needsMakeupArtist,
            comment: filmingRequest.comment,
            createdAt: filmingRequest.createdAt,
            updatedAt: filmingRequest.updatedAt
        };
    }

    async findRequests(userId: number) {
        const query = this.filmingRequestsRepository
            .createQueryBuilder('fr')
            .where('fr.receiverUserId = :userId', { userId })
            .leftJoinAndSelect('fr.location', 'frLocation')
            .leftJoinAndSelect('frLocation.place', 'frLocationPlace')
            .leftJoinAndSelect('fr.senderUser', 'senderUser')
            .leftJoinAndSelect('senderUser.profile', 'senderProfile')
            .leftJoinAndSelect('senderProfile.location', 'senderLocation')
            .leftJoinAndSelect('senderLocation.place', 'senderPlace')
            .orderBy(
                `CASE fr.status
                    WHEN 'pending' THEN 1
                    WHEN 'accepted' THEN 2
                    WHEN 'completed' THEN 3
                    WHEN 'rejected' THEN 4
                END`,
                'ASC'
            )
            .addOrderBy('fr.updatedAt', 'DESC');

        const data = await query.getMany();

        const filmingRequests = data.map(fr => this.createDto(fr));

        return { filmingRequests };
    }
}
