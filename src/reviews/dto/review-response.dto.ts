import { ApiProperty } from '@nestjs/swagger';
import { EntityType } from '@shared/enums/entity-type.enums';

import { UserShortResponseDto } from '@users/dto/user-response.dto';

// TODO: вынести
export class PhotoMinResponseDto {
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

    @ApiProperty({ type: UserShortResponseDto, nullable: true })
    entity: UserShortResponseDto;

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

    @ApiProperty({ type: [PhotoMinResponseDto] })
    photos: PhotoMinResponseDto[];

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
