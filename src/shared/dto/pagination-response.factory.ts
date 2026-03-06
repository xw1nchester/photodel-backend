import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export const PaginationResponseDtoFactory = <T>(itemType: Type<T>) => {
    class PaginationResponseDtoClass {
        @ApiProperty({ type: itemType, isArray: true })
        data: T[];

        @ApiProperty({ example: 120 })
        total: number;

        @ApiProperty({ example: 7 })
        totalPages: number;

        @ApiProperty({ example: false })
        isLast: number;
    }

    return PaginationResponseDtoClass;
};
