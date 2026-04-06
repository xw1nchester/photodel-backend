import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { UsersService } from '@users/users.service';

import { TeamRequestQueryDto } from './dto/team-request-query.dto';
import { TeamRequestDirection } from './enums/team-request-direction.enums';
import { TeamRequest, TeamRequestStatus } from './team-request.entity';

@Injectable()
export class TeamsService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(TeamRequest)
        private readonly teamRequestsRepository: Repository<TeamRequest>,
        private readonly usersService: UsersService
    ) {}

    async findById(id: number) {
        const existingRequest = await this.teamRequestsRepository.findOneBy({
            id
        });

        if (!existingRequest) {
            throw new NotFoundException('Запрос не найден');
        }

        return existingRequest;
    }

    async sendRequest(senderUserId: number, receiverUserId: number) {
        if (senderUserId == receiverUserId) {
            throw new BadRequestException(
                'Нельзя отправить запрос самому себе'
            );
        }

        const isRecieverExists = await this.usersService.exists(receiverUserId);

        if (!isRecieverExists) {
            throw new NotFoundException('Пользователь не найден');
        }

        const existingRequest = await this.teamRequestsRepository.findOne({
            where: [
                { senderUserId, receiverUserId },
                { receiverUserId: senderUserId, senderUserId: receiverUserId }
            ]
        });

        if (existingRequest?.status == TeamRequestStatus.REJECTED) {
            existingRequest.status = TeamRequestStatus.PENDING;
            return await this.teamRequestsRepository.save(existingRequest);
        }

        if (existingRequest) {
            throw new BadRequestException(
                'Запрос между этими пользователями уже существует'
            );
        }

        return await this.teamRequestsRepository.save({
            senderUserId,
            receiverUserId
        });
    }

    async acceptRequest(id: number, userId: number) {
        const existingRequest = await this.findById(id);

        if (existingRequest.receiverUserId != userId) {
            throw new BadRequestException('Нельзя выполнить данное действие');
        }

        existingRequest.status = TeamRequestStatus.ACCEPTED;
        return await this.teamRequestsRepository.save(existingRequest);
    }

    async rejectRequest(id: number, userId: number) {
        const existingRequest = await this.findById(id);

        if (existingRequest.receiverUserId != userId) {
            throw new BadRequestException('Нельзя выполнить данное действие');
        }

        existingRequest.status = TeamRequestStatus.REJECTED;

        return await this.teamRequestsRepository.save(existingRequest);
    }

    async removeRequest(id: number) {
        const existingRequest = await this.findById(id);
        return await this.teamRequestsRepository.remove(existingRequest);
    }

    createRequestDto(request: TeamRequest, userId: number) {
        const direction =
            request.senderUserId === userId
                ? TeamRequestDirection.OUTGOING
                : TeamRequestDirection.INCOMING;

        const user =
            direction == TeamRequestDirection.OUTGOING
                ? request.receiverUser
                : request.senderUser;

        return {
            id: request.id,
            status: request.status,
            direction,
            user: this.usersService.createUserBasicDto(user),
            createdAt: request.createdAt,
            updatedAt: request.updatedAt
        };
    }

    async findRequests(userId: number, { accepted }: TeamRequestQueryDto) {
        const query = this.teamRequestsRepository
            .createQueryBuilder('teamRequest')
            .leftJoinAndSelect('teamRequest.senderUser', 'senderUser')
            .leftJoinAndSelect('senderUser.profile', 'senderProfile')
            .leftJoinAndSelect(
                'senderProfile.proCategories',
                'senderProCategories'
            )
            .leftJoinAndSelect('senderProfile.location', 'senderLocation')
            .leftJoinAndSelect('senderLocation.place', 'senderPlace')
            .leftJoinAndSelect('teamRequest.receiverUser', 'receiverUser')
            .leftJoinAndSelect('receiverUser.profile', 'receiverProfile')
            .leftJoinAndSelect(
                'receiverProfile.proCategories',
                'receiverProCategories'
            )
            .leftJoinAndSelect('receiverProfile.location', 'receiverLocation')
            .leftJoinAndSelect('receiverLocation.place', 'receiverPlace')
            .where(
                '(teamRequest.senderUserId = :userId OR teamRequest.receiverUserId = :userId)',
                { userId }
            )
            .orderBy(
                `CASE 
                        WHEN teamRequest.status = 'pending' THEN 1
                        WHEN teamRequest.status = 'accepted' THEN 2
                        WHEN teamRequest.status = 'rejected' THEN 3
                        ELSE 4
                        END`,
                'ASC'
            )
            .addOrderBy('teamRequest.updatedAt', 'DESC');

        if (accepted) {
            query.andWhere('teamRequest.status = :status', {
                status: TeamRequestStatus.ACCEPTED
            });
        }

        const data = await query.getMany();

        const teamRequests = data.map(r => this.createRequestDto(r, userId));

        return { teamRequests };
    }

    async validateTeamMembers(
        userId: number,
        memberIds: number[]
    ): Promise<boolean> {
        console.log({
            method: 'validateTeamMembers',
            userId,
            memberIds
        });
        if (memberIds.length === 0) return;

        const count = await this.teamRequestsRepository.count({
            where: memberIds
                .map(memberId => ({
                    status: TeamRequestStatus.ACCEPTED,
                    senderUserId: userId,
                    receiverUserId: memberId
                }))
                .concat(
                    memberIds.map(memberId => ({
                        status: TeamRequestStatus.ACCEPTED,
                        senderUserId: memberId,
                        receiverUserId: userId
                    }))
                )
        });

        if (count < memberIds.length) {
            throw new BadRequestException(
                'Вы не можете взаимодействовать с указанными пользователями'
            );
        }
    }
}
