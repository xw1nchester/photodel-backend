import { ApiProperty } from '@nestjs/swagger';

import { ProCategoryDto } from './pro-category.dto';

export class ProCategoriesResponseDto {
    @ApiProperty({ type: ProCategoryDto, isArray: true })
    proCategories: ProCategoryDto[];
}
