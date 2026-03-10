import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class AlbumRequestDto {
    @ApiProperty({ example: 'Мой альбом' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'Описание альбома', nullable: true })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        example: 'e7cb06e8-1335-4b5c-bb46-0edfd4015aa1.jpeg',
        nullable: true
    })
    @IsString()
    @IsOptional()
    image?: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    isPublished: boolean;
}

export class AlbumCreateRequestDto extends AlbumRequestDto {
    @ApiProperty({ example: [1, 2] })
    @IsArray()
    photoIds: number[];
}
