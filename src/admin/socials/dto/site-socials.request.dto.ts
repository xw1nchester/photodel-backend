import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

class SiteSocialDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @Transform(({ value }) => Number(value))
    socialId: number;

    @ApiProperty({
        example: '+7 (999) 123-45-67'
    })
    @IsString()
    @IsNotEmpty()
    label: string;

    @ApiProperty({
        example: 'tel:+79991234567'
    })
    @IsString()
    @IsNotEmpty()
    url: string;
}

export class SiteSocialsRequestDto {
    @ApiProperty({ type: [SiteSocialDto] })
    @IsArray()
    socials: SiteSocialDto[];
}
