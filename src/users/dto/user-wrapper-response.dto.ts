import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class UserWrapperResponseDto {
    @ApiProperty({ type: UserResponseDto })
    user: UserResponseDto;
}
