import { ApiProperty } from '@nestjs/swagger';

export class SocialDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Instagram' })
    name: string;

    @ApiProperty({
        example: '<svg xmlns="http://www.w3.org/2000/svg"><circle r="1"/></svg>'
    })
    profileIcon: string;

    @ApiProperty({
        example: '<svg xmlns="http://www.w3.org/2000/svg"><circle r="1"/></svg>'
    })
    siteIcon: string;
}

export class SocialWrapperResponseDto {
    @ApiProperty({ type: SocialDto })
    social: SocialDto;
}

export class SocialsWrapperResponseDto {
    @ApiProperty({ type: SocialDto, isArray: true })
    socials: SocialDto[];
}
