import { ApiProperty } from '@nestjs/swagger';

export class UploadedFileDto {
    @ApiProperty()
    filename: string;

    @ApiProperty()
    mimetype: string;

    @ApiProperty()
    size: number;

    @ApiProperty()
    key: string;

    @ApiProperty()
    url: string;
}

export class UploadFilesResponseDto {
    @ApiProperty({ type: [UploadedFileDto] })
    files: UploadedFileDto[];
}
