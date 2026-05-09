import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SocialRequestDto {
    @ApiProperty({ example: 'Instagram' })
    @IsString()
    @IsNotEmpty()
    name: string;
    
    @ApiProperty({ example: '<svg xmlns="http://www.w3.org/2000/svg"><circle r="1"/></svg>' })
    @IsString()
    @IsNotEmpty()
    profileIcon: string;
    
    @ApiProperty({ example: '<svg xmlns="http://www.w3.org/2000/svg"><circle r="1"/></svg>' })
    @IsString()
    @IsNotEmpty()
    siteIcon: string;
}
