import { ApiProperty } from '@nestjs/swagger';

export class FileDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({
        example: 'photo.jpg'
    })
    originalName: string;

    @ApiProperty({
        example: 'image/jpeg'
    })
    mimeType: string;

    @ApiProperty({
        example: 245760
    })
    size: number;

    @ApiProperty({
        example: '019c8bc5-3ae1-77fd-8ac0-411117f900a4.jpeg'
    })
    key: string;

    @ApiProperty({
        example:
            'https://cdn.example.com/uploads/019c8bc5-3ae1-77fd-8ac0-411117f900a4.jpeg'
    })
    url: string;
}

export class FilesResponseDto {
    @ApiProperty({ type: [FileDto] })
    files: FileDto[];
}
