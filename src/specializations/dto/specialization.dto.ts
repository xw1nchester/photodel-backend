import { ApiProperty } from '@nestjs/swagger';

export class SpecializationDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;
}
