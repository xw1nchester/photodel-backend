import { ApiProperty } from '@nestjs/swagger';

import { TrainingRequestStatus } from '@training-requests/training-request.entity';
import { TrainingBasicResponseDto } from '@trainings/dto/training-response.dto';
import { UserShortResponseDto } from '@users/dto/user-response.dto';

class TrainingRequestResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ type: UserShortResponseDto })
    user: UserShortResponseDto;

    @ApiProperty({
        enum: TrainingRequestStatus,
        example: TrainingRequestStatus.PENDING
    })
    status: TrainingRequestStatus;

    @ApiProperty({ type: TrainingBasicResponseDto })
    training: TrainingBasicResponseDto;

    @ApiProperty({ example: '2026-02-28T17:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: '2026-02-28T17:00:00.000Z' })
    updatedAt: string;
}

export class TrainingRequestWrapperResponseDto {
    @ApiProperty({ type: TrainingRequestResponseDto, isArray: true })
    trainingRequests: TrainingRequestResponseDto[];
}
