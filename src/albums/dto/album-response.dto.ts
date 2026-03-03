import { ApiProperty } from '@nestjs/swagger';

export class AlbumResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Мой альбом' })
    title: string;

    @ApiProperty({ example: 'Описание альбома', nullable: true })
    description: string;

    @ApiProperty({ example: 'e7cb06e8-1335-4b5c-bb46-0edfd4015aa1.jpeg' })
    image: string;

    @ApiProperty({ example: true })
    isPublished: boolean;

    @ApiProperty({ example: 1 })
    userId: number;

    @ApiProperty({ example: '2026-02-28T17:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: '2026-02-28T17:00:00.000Z' })
    updatedAt: string;
}

export class AlbumWrapperResponseDto {
    @ApiProperty({ type: AlbumResponseDto })
    album: AlbumResponseDto;
}

export class AlbumsListWrapperResponseDto {
    @ApiProperty({ type: [AlbumResponseDto] })
    albums: AlbumResponseDto[];
}
