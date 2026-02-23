import { ApiProperty } from '@nestjs/swagger';

export class ProCategoryDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Фотографы' })
    name: string;
}

export class ProCategoriesResponseDto {
    @ApiProperty({ type: ProCategoryDto, isArray: true })
    proCategories: ProCategoryDto[];
}
