import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AvatarRequestDto {
    @ApiProperty({ description: 'Avatar file key in S3' })
    @IsString()
    avatar: string;
}
