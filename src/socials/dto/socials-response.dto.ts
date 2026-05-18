import { ApiProperty } from '@nestjs/swagger';

class SocialDto {
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

class SiteSocialDto extends SocialDto {
    @ApiProperty({
        example: '+7 (999) 123-45-67'
    })
    label: string;

    @ApiProperty({
        example: 'tel:+79991234567'
    })
    url: string;
}

export class SocialWrapperResponseDto {
    @ApiProperty({ type: SocialDto })
    social: SocialDto;
}

export class SocialsWrapperResponseDto {
    @ApiProperty({ type: SocialDto, isArray: true })
    socials: SocialDto[];
}

export class SiteSocialsWrapperResponseDto {
    @ApiProperty({ type: SiteSocialDto, isArray: true })
    socials: SiteSocialDto[];
}