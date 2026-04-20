import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

import { FileBasicResponseDto } from '@files/dto/files-response.dto';
import { PhotoResponseDto } from '@photos/dto/photo-response.dto';
import { EntityType } from '@shared/enums/entity-type.enums';
import { UserShortResponseDto } from '@users/dto/user-response.dto';

export class ReviewResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({
        enum: EntityType,
        example: EntityType.PHOTO
    })
    entityType: EntityType;

    @ApiProperty({ example: 1 })
    entityId: number;

    @ApiProperty({
        oneOf: [
            { $ref: getSchemaPath(UserShortResponseDto) },
            { $ref: getSchemaPath(PhotoResponseDto) }
        ],
        nullable: true
    })
    entity: UserShortResponseDto | PhotoResponseDto;

    @ApiProperty({
        example: 'Чудненько'
    })
    content?: string;

    @ApiProperty({
        example: 5,
        required: false,
        nullable: true
    })
    rating: number;

    @ApiProperty({ example: true })
    isPublished: boolean;

    @ApiProperty({ type: [FileBasicResponseDto] })
    photos: FileBasicResponseDto[];

    @ApiProperty({ type: UserShortResponseDto })
    user: UserShortResponseDto;

    @ApiProperty({ example: '2026-02-28T17:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: '2026-02-28T17:00:00.000Z' })
    updatedAt: string;
}

export class ReviewWrapperResponseDto {
    @ApiProperty({ type: ReviewResponseDto })
    review: ReviewResponseDto;
}
