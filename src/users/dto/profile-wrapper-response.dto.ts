import { ApiProperty } from '@nestjs/swagger';

import { ProfileResponseDto } from './profile-response.dto';

export class ProfileWrapperResponseDto {
    @ApiProperty({ type: ProfileResponseDto })
    profile: ProfileResponseDto;
}
