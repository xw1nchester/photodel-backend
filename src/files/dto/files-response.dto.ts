import { ApiProperty } from '@nestjs/swagger';

class FileDto {
    @ApiProperty({
        example: 'photo.jpg'
    })
    filename: string;

    @ApiProperty({
        example: 'image/jpeg'
    })
    mimetype: string;

    @ApiProperty({
        example: 245760
    })
    size: number;

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    key: string;

    @ApiProperty({
        example:
            'https://cdn.example.com/uploads/550e8400-e29b-41d4-a716-446655440000'
    })
    url: string;
}

export class FilesResponseDto {
    @ApiProperty({ type: [FileDto] })
    files: FileDto[];
}
