import { ApiProperty } from '@nestjs/swagger';

import { UserMeResponseDto } from '@users/dto/user-response.dto';

import { TokenResponseDto } from './token-response.dto';

export class AuthResponseDto extends TokenResponseDto {
    @ApiProperty({ type: UserMeResponseDto })
    user: UserMeResponseDto;
}
