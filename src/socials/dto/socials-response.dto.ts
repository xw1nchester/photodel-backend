import { ApiProperty } from '@nestjs/swagger';

export class SocialDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Instagram' })
    name: string;
}

export class SocialsResponseDto {
    @ApiProperty({ type: SocialDto, isArray: true })
    socials: SocialDto[];
}
