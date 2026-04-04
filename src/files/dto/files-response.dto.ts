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

export class FileBasicResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'e7cb06e8-1335-4b5c-bb46-0edfd4015aa1.jpeg' })
    key: string;

    @ApiProperty({
        example:
            'http://localhost:9000/uploads/e7cb06e8-1335-4b5c-bb46-0edfd4015aa1.jpeg'
    })
    url: string;
}
