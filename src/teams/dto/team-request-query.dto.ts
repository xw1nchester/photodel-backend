import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { TeamRequestStatus } from '@teams/team-request.entity';

export class TeamRequestQueryDto {
    @ApiProperty({
        enum: TeamRequestStatus,
        example: TeamRequestStatus.PENDING,
        required: false
    })
    @IsEnum(TeamRequestStatus)
    @IsOptional()
    status?: TeamRequestStatus;
}
