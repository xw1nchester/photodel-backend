import { ApiProperty } from '@nestjs/swagger';

import { TeamRequestDirection } from '@teams/enums/team-request-direction.enums';
import { TeamRequestStatus } from '@teams/team-request.entity';
import { UserShortResponseDto } from '@users/dto/user-response.dto';

class TeamRequestResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({
        enum: TeamRequestStatus,
        example: TeamRequestStatus.PENDING
    })
    status: TeamRequestStatus;

    @ApiProperty({
        enum: TeamRequestDirection,
        example: TeamRequestDirection.OUTGOING
    })
    direction: TeamRequestDirection;

    @ApiProperty({ type: () => UserShortResponseDto })
    user: UserShortResponseDto;

    @ApiProperty({ example: '2026-02-28T17:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: '2026-02-28T17:00:00.000Z' })
    updatedAt: string;
}

export class TeamRequestWrapperResponseDto {
    @ApiProperty({ type: TeamRequestResponseDto, isArray: true })
    teamRequests: TeamRequestResponseDto[];
}

export class TeamRequestBasicResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({
        enum: TeamRequestStatus,
        example: TeamRequestStatus.PENDING
    })
    status: TeamRequestStatus;

    @ApiProperty({
        enum: TeamRequestDirection,
        example: TeamRequestDirection.OUTGOING
    })
    direction: TeamRequestDirection;
}
