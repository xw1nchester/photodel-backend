import { ApiProperty } from '@nestjs/swagger';

export class NotificationsCountResponseDto {
    @ApiProperty({ example: 1 })
    filming: number;

    @ApiProperty({ example: 1 })
    training: number;

    @ApiProperty({ example: 1 })
    team: number;

    @ApiProperty({ example: 3 })
    unreadChats: number;

    @ApiProperty({ example: 6 })
    total: number;
}
