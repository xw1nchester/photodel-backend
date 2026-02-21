import { ApiProperty } from '@nestjs/swagger';

import { SocialDto } from './social.dto';

export class SocialsResponseDto {
    @ApiProperty({ type: SocialDto, isArray: true })
    socials: SocialDto[];
}
