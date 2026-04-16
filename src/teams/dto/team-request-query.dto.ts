import { ApiProperty } from '@nestjs/swagger';
import { TeamRequestStatus } from '@teams/team-request.entity';
import { IsEnum, IsOptional } from 'class-validator';

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
