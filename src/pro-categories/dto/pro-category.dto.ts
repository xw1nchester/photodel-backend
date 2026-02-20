import { ApiProperty } from '@nestjs/swagger';

export class ProCategoryDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;
}
